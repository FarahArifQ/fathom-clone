import { z } from "zod";
import { transcriptMatchSchema } from "./search-schema";

export const askInputSchema = z.strictObject({
  question: z.string().trim().min(3).max(500), scope: z.enum(["meeting", "all"]),
  meeting_id: z.string().trim().min(1).max(100),
  history: z.array(z.strictObject({
    role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(600),
    scope: z.enum(["meeting", "all"]),
  })).max(6).default([]),
});
export type AskInput = z.infer<typeof askInputSchema>;
export const aiAnswerSchema = z.strictObject({
  supported: z.boolean(), answer: z.string().trim().min(1).max(600), source_ids: z.array(z.uuid()).max(8),
}).refine((value) => value.supported ? value.source_ids.length > 0 : value.source_ids.length === 0,
  "Supported answers require citations; unsupported answers must not have citations.");
export const askAnswerSchema = z.strictObject({
  supported: z.boolean(), answer: z.string().trim().min(1).max(600), citations: z.array(transcriptMatchSchema).max(8),
  context_truncated: z.boolean(),
}).refine((value) => value.supported ? value.citations.length > 0 : value.citations.length === 0);
export type AskAnswer = z.infer<typeof askAnswerSchema>;
