"use client";

import { useRef, useState } from "react";
import { requestJson } from "@/lib/client-request";
import { askInputSchema, askAnswerSchema, type AskAnswer, type AskInput } from "@/lib/ask-schema";

export type AskTurn = {
  id: number; input: AskInput; status: "pending" | "answered" | "error";
  answer: AskAnswer | null; error: string;
};

export function useAsk() {
  const [turns, setTurns] = useState<AskTurn[]>([]);
  const busy = useRef(false);
  const nextId = useRef(0);

  async function send(turn: AskTurn) {
    try {
      const answer = await requestJson("/api/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(turn.input), signal: AbortSignal.timeout(115_000),
      }, askAnswerSchema);
      setTurns((current) => current.map((item) => item.id === turn.id ? { ...item, status: "answered", answer } : item));
    } catch (failure) {
      const error = failure instanceof Error ? failure.message : "Ask is unavailable right now. Please try again shortly.";
      setTurns((current) => current.map((item) => item.id === turn.id ? { ...item, status: "error", error } : item));
    } finally { busy.current = false; }
  }

  function ask(input: Omit<AskInput, "history">) {
    if (busy.current) return false;
    const history: AskInput["history"] = turns.filter((turn) => turn.status === "answered").slice(-3).flatMap((turn) => [
      { role: "user" as const, content: turn.input.question, scope: turn.input.scope },
      { role: "assistant" as const, content: turn.answer!.answer, scope: turn.input.scope },
    ]);
    const parsed = askInputSchema.safeParse({ ...input, history });
    if (!parsed.success) return false;
    const turn: AskTurn = { id: ++nextId.current, input: parsed.data, status: "pending", answer: null, error: "" };
    busy.current = true;
    setTurns((current) => [...current, turn]);
    void send(turn);
    return true;
  }

  function retry(id: number) {
    const turn = turns.find((item) => item.id === id);
    if (busy.current || !turn || turn.status !== "error") return;
    busy.current = true;
    setTurns((current) => current.map((item) => item.id === id ? { ...item, status: "pending", error: "" } : item));
    void send(turn);
  }

  function clear() {
    if (!busy.current) setTurns([]);
  }

  return { turns, pending: turns.some((turn) => turn.status === "pending"), ask, retry, clear };
}
