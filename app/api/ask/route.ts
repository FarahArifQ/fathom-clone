import { askInputSchema, askAnswerSchema } from "@/lib/ask-schema";
import { answerQuestion } from "@/lib/ask";
import { consumeAskRequest } from "@/lib/ask-usage";
import { interactionResponse, readInput } from "@/lib/interaction-api";
import { getAskContext } from "@/lib/ask-context";
import { createSupabaseClient } from "@/lib/supabase-client.mjs";
import { SummaryError } from "@/lib/summary-error";

export const maxDuration = 120;

export async function POST(request: Request) {
  return interactionResponse(async () => {
    const input = await readInput(request, askInputSchema);
    if (input.scope === "meeting") {
      const { data, error } = await createSupabaseClient().from("meetings").select("id").eq("id", input.meeting_id).maybeSingle();
      if (error) throw new SummaryError("Unable to load this meeting. Please try again shortly.", 503);
      if (!data) throw new SummaryError("This meeting was not found.", 404);
    }
    await consumeAskRequest();
    const context = await getAskContext(input);
    return askAnswerSchema.parse(await answerQuestion(input, context.lines, context.truncated));
  }, "Ask is temporarily unavailable. Please try again shortly.");
}
