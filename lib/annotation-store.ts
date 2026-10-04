import "server-only";
import { createSupabaseClient } from "./supabase-client.mjs";
import { annotationsSchema } from "./interaction-schema";
import { SummaryError as RequestError } from "./summary-error";

export async function getAnnotations(id: string) {
  const { data, error } = await createSupabaseClient().from("annotations")
    .select("id,type,timestamp_seconds,note").eq("meeting_id", id).order("timestamp_seconds");
  if (error) throw new RequestError("Unable to load meeting annotations.");
  const parsed = annotationsSchema.safeParse(data ?? []);
  if (!parsed.success) throw new RequestError("The saved annotations have an invalid format.");
  return parsed.data;
}
