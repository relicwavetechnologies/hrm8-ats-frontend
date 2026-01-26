import { z } from "zod";

export const accrualPolicySchema = z.object({
    name: z.string().min(3, "Policy name must be at least 3 characters"),
    leaveTypeId: z.string().min(1, "Leave type is required"),
    leaveTypeName: z.string().min(1, "Leave type name is required"),
    accrualMethod: z.enum(["annual", "monthly", "per-pay-period", "hours-worked"]),
    accrualRate: z.number().min(0, "Accrual rate must be a positive number"),
    accrualFrequency: z.enum(["yearly", "monthly", "biweekly", "per-hour"]),
    startDate: z.string().min(1, "Start date is required"),
    prorateFirstYear: z.boolean().default(true),
    prorateLastYear: z.boolean().default(false),
    maxAccrual: z.number().optional().nullable(),
    carryoverAllowed: z.boolean().default(true),
    maxCarryover: z.number().optional().nullable(),
    negativeBalanceAllowed: z.boolean().default(false),
    effectiveDate: z.string().min(1, "Effective date is required"),
    isActive: z.boolean().default(true),
    tenureBasedRates: z.array(z.object({
        yearsFrom: z.number(),
        yearsTo: z.number().optional(),
        accrualRate: z.number()
    })).optional()
});

export type AccrualPolicyFormData = z.infer<typeof accrualPolicySchema>;
