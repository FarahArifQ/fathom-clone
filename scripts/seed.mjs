import { readFile } from "node:fs/promises";
import { createSupabaseClient } from "../lib/supabase-client.mjs";

async function seed() {
  const source = JSON.parse(await readFile(new URL("../data/seed-meetings.json", import.meta.url), "utf8"));
  const supabase = createSupabaseClient();
  const meetings = source.meetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    type: meeting.type,
    date: meeting.date,
    duration_seconds: meeting.durationMinutes * 60,
    is_seed: true,
  }));
  const attendees = source.meetings.flatMap((meeting) => meeting.participants.map((name) => ({
    meeting_id: meeting.id, name, is_seed: true,
  })));
  const segments = source.meetings.flatMap((meeting) => meeting.transcript.map((segment) => {
    if (!/^\d{2,}:[0-5]\d$/.test(segment.t)) throw new Error("Invalid seed timestamp.");
    const [minutes, seconds] = segment.t.split(":").map(Number);
    return {
      meeting_id: meeting.id,
      speaker: segment.speaker,
      text: segment.text,
      start_seconds: minutes * 60 + seconds,
      is_seed: true,
    };
  }));

  for (const [table, rows, onConflict] of [
    ["meetings", meetings, "id"],
    ["attendees", attendees, "meeting_id,name"],
    ["transcript_segments", segments, "meeting_id,start_seconds,speaker"],
  ]) {
    const { error } = await supabase.from(table).upsert(rows, { onConflict });
    if (error) throw new Error("Seed write failed.");
  }
  console.log(`Seed loaded: ${meetings.length} meetings, ${attendees.length} attendees, ${segments.length} transcript segments.`);
}

seed().catch(() => {
  console.error("Seeding failed. Check server configuration and run supabase/schema.sql first. Safe to retry; raw errors are not logged.");
  process.exitCode = 1;
});
