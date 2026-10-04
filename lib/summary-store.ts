import "server-only";
import { createSupabaseClient } from "./supabase-client.mjs";
import { summarySchema, type MeetingSummary } from "./summary-schema";
import { SummaryError } from "./summary-error";

export async function getSavedSummary(id: string): Promise<MeetingSummary | null> {
  const supabase = createSupabaseClient();
  const { data: summary, error } = await supabase.from("summaries").select("tldr,markdown")
    .eq("meeting_id", id).limit(1).maybeSingle<{ tldr: string; markdown: string }>();
  if (error) throw new SummaryError("Unable to load the saved summary.");
  if (!summary) return null;
  const [actions, chapters] = await Promise.all([
    supabase.from("action_items").select("description,assignee,timestamp_seconds").eq("meeting_id", id)
      .order("timestamp_seconds").returns<MeetingSummary["action_items"]>(),
    supabase.from("chapters").select("title,start_seconds").eq("meeting_id", id)
      .order("start_seconds").returns<MeetingSummary["chapters"]>(),
  ]);
  if (actions.error || chapters.error) throw new SummaryError("Unable to load the saved meeting insights.");
  const parsed = summarySchema.safeParse({ tldr: summary.tldr, summary_markdown: summary.markdown,
    action_items: actions.data ?? [], chapters: chapters.data ?? [] });
  if (!parsed.success) throw new SummaryError("The saved summary has an invalid format.");
  return parsed.data;
}

export async function summaryRpc(name: string, id: string, token: string, result?: MeetingSummary) {
  const { data, error } = await createSupabaseClient().rpc(name, {
    p_meeting_id: id, p_token: token, ...(result ? { p_result: result } : {}),
  });
  if (error) throw new SummaryError("Unable to update summary generation. Apply the latest Supabase schema and retry.");
  return data as unknown;
}
