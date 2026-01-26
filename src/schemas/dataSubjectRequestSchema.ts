import { z } from "zod";

export const dataSubjectRequestSchema = z.object({
  type: z.enum(["access", "deletion", "correction", "portability"]),
  employeeId: z.string().min(1, "Employee is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  requestDate: z.string().min(1, "Request date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  assignedTo: z.string().optional(),
  notes: z.string().max(1000).optional(),
}).refine((data) => new Date(data.requestDate) <= new Date(data.dueDate), {
  message: "Due date must be after request date",
  path: ["dueDate"],
});

export type DataSubjectRequestFormData = z.infer<typeof dataSubjectRequestSchema>;
