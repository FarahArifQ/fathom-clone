import "server-only";
import { createSupabaseClient } from "./supabase-client.mjs";
import { transcriptMatchesSchema } from "./search-schema";
import { SummaryError } from "./summary-error";

const stopWords = new Set("a an and are as at be been by can did do does for from had has have how i in is it me of on or our please that the their them there these they this to us was we were what when where which who why will with would you your".split(" "));

export function questionTerms(question: string) {
  return [...new Set((question.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .map((word) => word.length > 3 ? word.replace(/(?:ies|ing|ed|es|s)$/, "") : word)
    .filter((word) => word.length >= 3))].slice(0, 8);
}

type MatchRow = { id: string; meeting_id: string; speaker: string; start_seconds: number; text: string; meetings: { title: string } };

export async function searchTranscript(text?: string, meetingId?: string, keywords = false) {
  const terms = keywords ? questionTerms(text ?? "") : [];
  if (keywords && !terms.length) return [];
  let query = createSupabaseClient().from("transcript_segments")
    .select("id,meeting_id,speaker,start_seconds,text,meetings!inner(title)")
    .order("meeting_id").order("start_seconds").order("id");
  if (meetingId) query = query.eq("meeting_id", meetingId);
  if (text) query = keywords ? query.or(terms.map((term) => `text.ilike.%${term}%`).join(","))
    : query.ilike("text", `%${text.replace(/[\\%_]/g, "\\$&")}%`);
  const matches: MatchRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await query.range(offset, offset + 999).returns<MatchRow[]>();
    if (error) throw new SummaryError("Transcript search is unavailable right now. Please try again shortly.", 503);
    matches.push(...data ?? []);
    if (!data || data.length < 1000) break;
  }
  const parsed = transcriptMatchesSchema.safeParse(matches.map((row) => ({
    id: row.id, meeting_id: row.meeting_id, meeting_title: row.meetings.title,
    speaker: row.speaker, timestamp_seconds: row.start_seconds, text: row.text,
  })));
  if (!parsed.success) throw new SummaryError("Transcript search returned an unreadable result. Please retry.", 503);
  if (!keywords) return parsed.data;
  const score = (line: string) => terms.filter((term) => line.toLowerCase().includes(term)).length;
  return parsed.data.sort((a, b) => score(b.text) - score(a.text)).slice(0, 16);
}
