import { z } from "zod";

export const enrollmentPeriodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(['open', 'new-hire', 'life-event']),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    effectiveDate: z.string().min(1, "Effective date is required"),
    eligiblePlanIds: z.array(z.string()).default([]),
    notificationDays: z.number().min(0).default(30),
    autoEnroll: z.boolean().default(false),
    reminderFrequency: z.enum(['none', 'daily', 'weekly']).default('weekly'),
    status: z.enum(['upcoming', 'active', 'closed']).default('upcoming'),
});

export type EnrollmentPeriodFormData = z.infer<typeof enrollmentPeriodSchema>;

export const lifeEventSchema = z.object({
    eventType: z.string().min(1, "Event type is required"),
    eventDate: z.string().min(1, "Event date is required"),
    employeeId: z.string().min(1, "Employee is required"),
    notes: z.string().optional(),
});

export type LifeEventFormData = z.infer<typeof lifeEventSchema>;

export const cobraSchema = z.object({
    employeeId: z.string().min(1, "Employee is required"),
    qualifyingEvent: z.string().min(1, "Event is required"),
    eventDate: z.string().min(1, "Event date is required"),
    coverageEndDate: z.string().min(1, "Coverage end date is required"),
});

export type COBRAFormData = z.infer<typeof cobraSchema>;
