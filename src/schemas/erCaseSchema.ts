import { z } from "zod";

export const erCaseSchema = z.object({
  type: z.enum(["grievance", "complaint", "disciplinary", "investigation", "mediation"]),
  category: z.enum(["harassment", "discrimination", "policy-violation", "performance", "conduct", "workplace-safety", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  confidential: z.boolean().default(true),
  reportedBy: z.string().optional(),
  reportedByName: z.string().optional(),
  affectedEmployees: z.array(z.string()).min(1, "At least one affected employee is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  assignedTo: z.array(z.string()).min(1, "At least one investigator must be assigned"),
});

export type ERCaseFormData = z.infer<typeof erCaseSchema>;
