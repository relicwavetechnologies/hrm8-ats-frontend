import { z } from "zod";

export const cobraSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  qualifyingEvent: z.enum(["termination", "reduction-hours", "death", "divorce", "loss-dependent", "medicare"]),
  eventDate: z.string().min(1, "Event date is required"),
  notificationDate: z.string().min(1, "Notification date is required"),
  electionDeadline: z.string().min(1, "Election deadline is required"),
  cobraStartDate: z.string().min(1, "COBRA start date is required"),
  maxCoverageDuration: z.number().min(18).max(36).default(18),
  premiumAmount: z.number().min(0, "Premium must be non-negative"),
  administrativeFee: z.number().min(0).default(0),
  status: z.enum(["pending", "active", "expired", "terminated"]).default("pending"),
  coverageElected: z.boolean().default(false),
  notes: z.string().optional(),
});

export type COBRAFormData = z.infer<typeof cobraSchema>;
