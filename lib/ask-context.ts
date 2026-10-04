import "server-only";
import type { AskInput } from "./ask-schema";
import type { TranscriptMatch } from "./search-schema";
import { searchTranscript } from "./transcript-search";

export function fitTranscript(lines: TranscriptMatch[], limit: number, lineLimit = Infinity) {
  const included: TranscriptMatch[] = [];
  let used = 2;
  let truncated = false;
  for (const line of lines) {
    const overhead = JSON.stringify({ ...line, text: "" }).length + (included.length ? 1 : 0);
    const available = limit - used - overhead;
    if (available < 6) { truncated = true; break; }
    // JSON can expand each character to six characters (for example a control character).
    let text = line.text.slice(0, Math.min(lineLimit, available));
    while (JSON.stringify(text).length - 2 > available) text = text.slice(0, Math.floor(text.length * 0.9));
    if (!text.length) { truncated = true; break; }
    const excerpt = { ...line, text };
    used += JSON.stringify(excerpt).length + (included.length ? 1 : 0);
    included.push(excerpt);
    truncated ||= text.length < line.text.length;
    if (text.length < line.text.length && lineLimit === Infinity) break;
  }
  return { lines: included, truncated: truncated || included.length < lines.length };
}

export async function getAskContext(input: AskInput) {
  if (input.scope === "meeting") {
    return fitTranscript(await searchTranscript(undefined, input.meeting_id), 64_000);
  }
  const previousQuestions = input.history.filter((turn) => turn.role === "user").slice(-2).map((turn) => turn.content);
  const lines = await searchTranscript([input.question, ...previousQuestions].join(" "), undefined, true);
  return fitTranscript(lines, 16_000, 1500);
}
