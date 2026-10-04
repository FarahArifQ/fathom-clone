import type { z } from "zod";

export async function requestJson<T extends z.ZodType>(url: string, options: RequestInit, schema: T): Promise<z.output<T>> {
  let response: Response;
  try { response = await fetch(url, { signal: AbortSignal.timeout(15_000), ...options }); }
  catch { throw new Error("The request timed out or could not reach the server. Please retry."); }
  let body: unknown;
  try { body = await response.json(); }
  catch { throw new Error("The server returned an unreadable response. Please retry."); }
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
      ? body.error : "Unable to save the change. Please retry.";
    throw new Error(message);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new Error("The server returned an invalid response. Please retry.");
  return parsed.data;
}
