import "server-only";
import { z } from "zod";
import { createSupabaseClient } from "./supabase-client.mjs";
import { SummaryError } from "./summary-error";

export async function consumeAskRequest() {
  const limit = z.coerce.number().int().min(1).max(10000).safeParse(process.env.ASK_DAILY_LIMIT?.trim() || 50);
  if (!limit.success) {
    console.error("Ask daily limit configuration is invalid.");
    throw new SummaryError("Ask is temporarily unavailable. Please try again shortly.", 503);
  }
  const { data, error } = await createSupabaseClient().rpc("consume_ask_request", { p_limit: limit.data });
  if (error || typeof data !== "boolean") {
    console.error("Unable to check Ask usage. Apply supabase/ask-usage.sql.");
    throw new SummaryError("Ask is temporarily unavailable. Please try again shortly.", 503);
  }
  if (!data) throw new SummaryError("We've reached today's shared Ask limit. Please come back tomorrow; it resets at midnight UTC.", 429);
}
