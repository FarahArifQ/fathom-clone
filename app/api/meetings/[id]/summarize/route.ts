import { randomUUID } from "node:crypto";
import { getMeetings } from "@/lib/supabase";
import { getSavedSummary, summaryRpc } from "@/lib/summary-store";
import { generateMeetingSummary } from "@/lib/gemini";
import { SummaryError } from "@/lib/summary-error";

export const maxDuration = 120;

export async function POST(_request: Request, { params }: RouteContext<"/api/meetings/[id]/summarize">) {
  const { id } = await params;
  const token = randomUUID();
  let claimed = false;
  try {
    const saved = await getSavedSummary(id);
    if (saved) return Response.json(saved);
    const [meeting] = await getMeetings(id);
    if (!meeting) throw new SummaryError("Meeting not found.", 404);
    if (!meeting.transcript.length) throw new SummaryError("This meeting has no transcript to summarize.", 422);
    const state = await summaryRpc("claim_summary_generation", id, token);
    if (state === "saved") return Response.json(await getSavedSummary(id));
    if (state === "busy") throw new SummaryError("A summary is already being generated. Try again shortly.", 409);
    if (state !== "claimed") throw new SummaryError("Meeting not found.", 404);
    claimed = true;
    const result = await generateMeetingSummary(meeting);
    await summaryRpc("save_meeting_summary", id, token, result);
    const persisted = await getSavedSummary(id);
    if (!persisted) throw new SummaryError("Unable to retrieve the saved summary. Please retry.");
    return Response.json(persisted);
  } catch (error) {
    const failure = error instanceof SummaryError ? error : new SummaryError("Summary generation failed. Check the server setup and retry.");
    console.error(failure.message);
    return Response.json({ error: failure.message }, { status: failure.status });
  } finally {
    if (claimed) {
      try { await summaryRpc("release_summary_generation", id, token); }
      catch { console.error("Unable to release the generation claim; it will expire automatically."); }
    }
  }
}
