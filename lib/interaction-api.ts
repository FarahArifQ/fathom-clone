import "server-only";
import type { z } from "zod";
import { SummaryError as RequestError } from "./summary-error";

export async function readInput<T extends z.ZodType>(request: Request, schema: T): Promise<z.output<T>> {
  let body: unknown;
  try { body = await request.json(); }
  catch { throw new RequestError("Send a valid JSON request body.", 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new RequestError("The request contains invalid fields.", 400);
  return parsed.data;
}

export async function interactionResponse(work: () => Promise<unknown>, message = "Unable to save the change. Please retry.") {
  try { return Response.json(await work()); }
  catch (error) {
    const failure = error instanceof RequestError ? error : new RequestError(message);
    console.error(failure.message);
    return Response.json({ error: failure.message }, { status: failure.status });
  }
}
