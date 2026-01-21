import { z } from "zod";

export const TicketSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(80, "Title must be less than 80 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters"),
  status: z.enum(["open", "in_progress", "closed"]),
  priority: z
    .number()
    .min(1, "Priority must be between 1 and 5")
    .max(5, "Priority must be between 1 and 5"),
  assignees: z
    .array(z.string())
    .optional(),
});

export type TicketFormData = z.infer<typeof TicketSchema>;