import z from "zod";

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.date({
    message: "A date is required",
  }),
});

export type EventFormValues = z.infer<typeof eventSchema>;
