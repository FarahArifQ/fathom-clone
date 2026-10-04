import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase-client.mjs";
import { actionInputSchema, actionUpdateSchema } from "@/lib/interaction-schema";
import { interactionResponse, readInput } from "@/lib/interaction-api";
import { SummaryError as RequestError } from "@/lib/summary-error";

export async function PATCH(request: Request, { params }: RouteContext<"/api/action-items/[id]">) {
  return interactionResponse(async () => {
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) throw new RequestError("Invalid action item ID.", 400);
    const input = await readInput(request, actionInputSchema);
    const { data, error } = await createSupabaseClient().from("action_items").update(input)
      .eq("id", id).select("id,completed").maybeSingle();
    if (error) throw new RequestError("Unable to save the action item. Please retry.");
    if (!data) throw new RequestError("Action item not found.", 404);
    const parsed = actionUpdateSchema.safeParse(data);
    if (!parsed.success) throw new RequestError("The saved action item has an invalid format.");
    return parsed.data;
  });
}
