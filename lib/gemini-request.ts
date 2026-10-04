import "server-only";
import { setTimeout as pause } from "node:timers/promises";
import { z } from "zod";
import { SummaryError } from "./summary-error";

export const AI_BUSY_MESSAGE = "The AI service is busy right now. Please try again in a minute.";
const delays = [2000, 5000, 10_000];
const envelopeSchema = z.object({ candidates: z.array(z.object({
  finishReason: z.string(),
  content: z.object({ parts: z.array(z.object({ text: z.string().optional(), thought: z.boolean().optional() })) }),
})).min(1) });

type GeminiInput = { instructions: string; data: unknown; schema: object; maxOutputTokens: number };

async function attempt(model: string, key: string, input: GeminiInput, timeout: number) {
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(timeout),
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.instructions }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(input.data) }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: input.schema, maxOutputTokens: input.maxOutputTokens },
      }),
    });
  } catch {
    console.error("AI request could not reach the service or timed out.");
    return { ok: false as const, retry: true };
  }
  if (!response.ok) {
    console.error(`AI request failed (HTTP ${response.status}).`);
    await response.body?.cancel().catch(() => {});
    return { ok: false as const, retry: [429, 503].includes(response.status) };
  }
  let envelope: unknown;
  try { envelope = await response.json(); }
  catch (error) {
    console.error("AI response could not be read.");
    return { ok: false as const, retry: !(error instanceof SyntaxError) };
  }
  try {
    const parsed = envelopeSchema.safeParse(envelope);
    if (!parsed.success || parsed.data.candidates[0].finishReason !== "STOP") throw new Error();
    const text = parsed.data.candidates[0].content.parts.filter((part) => !part.thought).map((part) => part.text ?? "").join("");
    const value: unknown = JSON.parse(text);
    return { ok: true as const, value };
  } catch {
    console.error("AI returned an incomplete or invalid JSON response.");
    return { ok: false as const, retry: false };
  }
}

export async function requestGemini(input: GeminiInput): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  const fallback = process.env.GEMINI_FALLBACK_MODEL;
  if (!key || !model) {
    console.error("AI server configuration is missing.");
    throw new SummaryError(AI_BUSY_MESSAGE, 503);
  }
  const deadline = Date.now() + 107_000;
  for (let index = 0; index <= delays.length; index++) {
    const reservedWaits = delays.slice(index).reduce((total, delay) => total + delay, 0);
    const remainingAttempts = delays.length - index + (fallback ? 1 : 0);
    const timeout = Math.max(1000, Math.min(75_000, deadline - Date.now() - reservedWaits - remainingAttempts * 5000));
    const result = await attempt(model, key, input, timeout);
    if (result.ok) return result.value;
    if (!result.retry || index === delays.length) break;
    await pause(delays[index]);
  }
  if (fallback) {
    const result = await attempt(fallback, key, input, Math.max(1000, Math.min(75_000, deadline - Date.now())));
    if (result.ok) return result.value;
  }
  throw new SummaryError(AI_BUSY_MESSAGE, 503);
}
