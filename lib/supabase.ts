import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { type Meeting } from "./meetings";
import { createSupabaseClient } from "./supabase-client.mjs";

type MeetingRow = {
  id: string;
  title: string;
  type: string;
  date: string;
  duration_seconds: number;
  is_seed: boolean;
  attendees: { name: string }[];
  transcript_segments: { start_seconds: number; speaker: string; text: string }[];
};

export const getMeetings = cache(async (id?: string): Promise<Meeting[]> => {
  await connection();
  const supabase = createSupabaseClient();
  let query = supabase.from("meetings").select(
    "id,title,type,date,duration_seconds,is_seed,attendees(name),transcript_segments(start_seconds,speaker,text)",
  ).order("date", { ascending: false });
  if (id) query = query.eq("id", id);
  const { data, error } = await query.returns<MeetingRow[]>();
  if (error) throw new Error("Unable to load meetings. Check the Supabase setup.");
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    type: row.type,
    date: row.date,
    durationMinutes: row.duration_seconds / 60,
    isSeed: row.is_seed,
    participants: row.attendees.map((attendee) => attendee.name).sort(),
    transcript: row.transcript_segments.sort((a, b) => a.start_seconds - b.start_seconds).map((segment) => ({
      startSeconds: segment.start_seconds, speaker: segment.speaker, text: segment.text,
    })),
  }));
});
