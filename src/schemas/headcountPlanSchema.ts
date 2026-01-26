import { z } from "zod";

export const plannedPositionSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  level: z.string().min(1, "Level is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().optional(),
  hireDate: z.string().min(1, "Hire date is required"),
  estimatedSalary: z.number().min(0, "Salary must be non-negative"),
  positionType: z.enum(["new", "replacement", "backfill"]),
  replacingEmployeeId: z.string().optional(),
  replacingEmployeeName: z.string().optional(),
  justification: z.string().min(10, "Justification is required"),
  status: z.enum(["planned", "approved", "requisitioned", "filled", "cancelled"]).default("planned"),
});

export const headcountPlanSchema = z.object({
  fiscalYear: z.number().min(2020).max(2050),
  quarter: z.number().min(1).max(4).optional(),
  department: z.string().min(1, "Department is required"),
  location: z.string().optional(),
  currentHeadcount: z.number().min(0),
  plannedHeadcount: z.number().min(0),
  budgetAllocated: z.number().min(0, "Budget must be non-negative"),
  notes: z.string().optional(),
  positions: z.array(plannedPositionSchema).default([]),
}).refine((data) => data.plannedHeadcount >= data.currentHeadcount || data.positions.length > 0, {
  message: "Planned headcount should be >= current or include position details",
  path: ["plannedHeadcount"],
});

export type HeadcountPlanFormData = z.infer<typeof headcountPlanSchema>;
export type PlannedPositionFormData = z.infer<typeof plannedPositionSchema>;
