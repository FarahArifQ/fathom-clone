import { interactionResponse } from "@/lib/interaction-api";
import { searchInputSchema } from "@/lib/search-schema";
import { searchTranscript } from "@/lib/transcript-search";
import { SummaryError } from "@/lib/summary-error";

export async function GET(request: Request) {
  return interactionResponse(async () => {
    const parsed = searchInputSchema.safeParse(new URL(request.url).searchParams.get("q"));
    if (!parsed.success) throw new SummaryError("Enter a search of 1 to 200 characters.", 400);
    return searchTranscript(parsed.data);
  }, "Transcript search is unavailable right now. Please try again shortly.");
}
