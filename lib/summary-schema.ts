import { z } from "zod";
import type { Meeting } from "./meetings";

export function summarySections(markdown: string) {
  return markdown.trim().split(/^## /m).filter(Boolean).map((section) => {
    const [title, ...lines] = section.split("\n");
    return { title, items: lines.map((line) => line.trim()).filter(Boolean) };
  });
}

const text = z.string().trim().min(1);
const timestamp = z.number().int().nonnegative();
export const summarySchema = z.strictObject({
  tldr: text.max(400).refine((value) => !value.includes("\n") &&
    (value.match(/[.!?](?=\s+[A-Z]|$)/g) ?? []).length <= 1, "TL;DR must be one sentence."),
  summary_markdown: text.max(6000).refine((value) => {
    const sections = summarySections(value);
    const items = sections.flatMap((section) => section.items);
    const normalized = items.map((item) => item.toLowerCase().replace(/[^a-z0-9]/g, ""));
    return sections.length === 2 && sections[0].title === "Decisions" && sections[1].title === "Key points" &&
      sections.every((section) => section.items.length > 0 && section.items.every((item) => /^- \S/.test(item))) &&
      new Set(normalized).size === normalized.length;
  }, "Use Decisions and Key points sections with distinct bullet points."),
  action_items: z.array(z.strictObject({ description: text.max(600), assignee: text.nullable(), timestamp_seconds: timestamp })).max(50),
  chapters: z.array(z.strictObject({ title: text.max(120), start_seconds: timestamp })).min(1).max(8),
});
export type MeetingSummary = z.infer<typeof summarySchema>;

export function chapterRange(meeting: Meeting) {
  const longCall = meeting.durationMinutes >= 30 && meeting.transcript.length >= 30;
  return { min: longCall ? 3 : 1, max: longCall ? 8 : 2 };
}

export function validateSummary(value: unknown, meeting: Meeting) {
  const parsed = summarySchema.safeParse(value);
  if (!parsed.success) throw new Error("AI result is invalid: check TL;DR, summary sections, action items, and chapters.");
  const result = parsed.data;
  const timestamps = new Set(meeting.transcript.map((line) => line.startSeconds));
  if (result.action_items.some((item) => !timestamps.has(item.timestamp_seconds) ||
    (item.assignee !== null && !meeting.participants.includes(item.assignee)))) {
    throw new Error("AI result is invalid: action items must reference transcript timestamps and known attendees.");
  }
  const range = chapterRange(meeting);
  if (result.chapters.length < range.min || result.chapters.length > range.max ||
    result.chapters.some((chapter, index) => !timestamps.has(chapter.start_seconds) ||
      (index > 0 && chapter.start_seconds <= result.chapters[index - 1].start_seconds))) {
    throw new Error("AI result is invalid: chapters must use ordered transcript timestamps and the requested chapter count.");
  }
  return result;
}
