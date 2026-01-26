import { z } from "zod";

export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
  isHalfDay: z.boolean().default(false),
  halfDayPeriod: z.enum(["morning", "afternoon"]).optional(),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;
