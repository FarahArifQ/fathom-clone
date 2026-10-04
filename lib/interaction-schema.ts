import { z } from "zod";
import { summarySchema } from "./summary-schema";

export const actionUpdateSchema = z.strictObject({ id: z.uuid(), completed: z.boolean() });
export const actionInputSchema = actionUpdateSchema.omit({ id: true });
export const savedSummarySchema = summarySchema.extend({
  action_items: z.array(summarySchema.shape.action_items.element.extend({
    id: z.uuid(), completed: z.boolean(),
  })).max(50),
});
export type SavedSummary = z.infer<typeof savedSummarySchema>;

export const annotationInputSchema = z.strictObject({
  type: z.enum(["highlight", "note"]),
  timestamp_seconds: z.number().int().nonnegative(),
  note: z.string().trim().min(1).max(10000),
});
export const annotationSchema = annotationInputSchema.extend({ id: z.uuid() });
export const annotationsSchema = z.array(annotationSchema);
export type Annotation = z.infer<typeof annotationSchema>;
