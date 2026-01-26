import { z } from "zod";

export const enrollmentPeriodSchema = z.object({
  name: z.string().min(1, "Period name is required").max(100),
  type: z.enum(["open", "new-hire", "life-event"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  eligiblePlanIds: z.array(z.string()).min(1, "At least one plan must be selected"),
  notificationDays: z.number().min(0).max(90).default(30),
  autoEnroll: z.boolean().default(false),
  reminderFrequency: z.enum(["none", "daily", "weekly"]).default("weekly"),
  status: z.enum(["upcoming", "active", "closed"]).default("upcoming"),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type EnrollmentPeriodFormData = z.infer<typeof enrollmentPeriodSchema>;
