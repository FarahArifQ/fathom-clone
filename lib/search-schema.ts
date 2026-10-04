import { z } from "zod";

export const searchInputSchema = z.string().trim().min(1).max(200);
export const transcriptMatchSchema = z.strictObject({
  id: z.uuid(), meeting_id: z.string().min(1), meeting_title: z.string().min(1),
  speaker: z.string().min(1), timestamp_seconds: z.number().int().nonnegative(), text: z.string().min(1),
});
export const transcriptMatchesSchema = z.array(transcriptMatchSchema);
export type TranscriptMatch = z.infer<typeof transcriptMatchSchema>;
