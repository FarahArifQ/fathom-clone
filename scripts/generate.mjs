import { setTimeout as pause } from "node:timers/promises";
import { createSupabaseClient } from "../lib/supabase-client.mjs";

async function generate() {
  const base = new URL(process.argv[2] ?? "http://localhost:3000");
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) {
    throw new Error("Use an HTTP app URL without credentials.");
  }
  const { data, error } = await createSupabaseClient().from("meetings")
    .select("id,summaries(id)").order("date");
  if (error) throw new Error("Unable to list meetings. Check the Supabase setup.");
  const pending = (data ?? []).filter((meeting) => !meeting.summaries.length);
  for (const [index, meeting] of pending.entries()) {
    try {
      const response = await fetch(new URL(`/api/meetings/${encodeURIComponent(meeting.id)}/summarize`, base), {
        method: "POST", signal: AbortSignal.timeout(115_000),
      });
      if (!response.ok) {
        console.error(`Summary request failed for ${meeting.id} (HTTP ${response.status}). Check the app's server error message and rerun to retry.`);
        process.exitCode = 1;
      }
      await response.body?.cancel();
    } catch {
      console.error(`Unable to complete summary request for ${meeting.id}. Ensure the app is running; rerun to retry.`);
      process.exitCode = 1;
    }
    if (index < pending.length - 1) await pause(1500);
  }
}

generate().catch(() => {
  console.error("Batch generation failed. Check the app URL and Supabase server configuration.");
  process.exitCode = 1;
});
