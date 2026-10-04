import { createSupabaseClient } from "@/lib/supabase-client.mjs";
import { annotationInputSchema, annotationSchema } from "@/lib/interaction-schema";
import { interactionResponse, readInput } from "@/lib/interaction-api";
import { SummaryError as RequestError } from "@/lib/summary-error";

export async function POST(request: Request, { params }: RouteContext<"/api/meetings/[id]/annotations">) {
  return interactionResponse(async () => {
    const { id } = await params;
    const input = await readInput(request, annotationInputSchema);
    const supabase = createSupabaseClient();
    const segment = await supabase.from("transcript_segments").select("id")
      .eq("meeting_id", id).eq("start_seconds", input.timestamp_seconds).limit(1).maybeSingle();
    if (segment.error) throw new RequestError("Unable to check the transcript. Please retry.");
    if (!segment.data) throw new RequestError("The transcript moment was not found in this meeting.", 404);
    let saved: unknown;
    if (input.type === "highlight") {
      const existing = await supabase.from("annotations").select("id,type,timestamp_seconds,note")
        .eq("meeting_id", id).eq("type", "highlight").eq("timestamp_seconds", input.timestamp_seconds).limit(1).maybeSingle();
      if (existing.error) throw new RequestError("Unable to check existing highlights. Please retry.");
      saved = existing.data;
    }
    if (!saved) {
      const result = await supabase.from("annotations").insert({ meeting_id: id, ...input })
        .select("id,type,timestamp_seconds,note").single();
      if (result.error) throw new RequestError("Unable to save the annotation. Please retry.");
      saved = result.data;
    }
    const parsed = annotationSchema.safeParse(saved);
    if (!parsed.success) throw new RequestError("The saved annotation has an invalid format.");
    return parsed.data;
  });
}
