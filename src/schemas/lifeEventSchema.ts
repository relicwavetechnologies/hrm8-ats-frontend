import { z } from "zod";

export const lifeEventSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  eventType: z.enum(["marriage", "divorce", "birth", "adoption", "death", "loss-coverage", "other"]),
  eventDate: z.string().min(1, "Event date is required"),
  documentationReceived: z.boolean().default(false),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
  specialEnrollmentPeriod: z.number().min(30).max(60).default(30),
  notes: z.string().optional(),
  affectedDependents: z.array(z.string()).default([]),
  processed: z.boolean().default(false),
});

export type LifeEventFormData = z.infer<typeof lifeEventSchema>;
