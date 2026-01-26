import { z } from "zod";

export const erCaseSchema = z.object({
    title: z.string().optional(),
    employeeId: z.string().optional(),
    type: z.enum(['grievance', 'complaint', 'disciplinary', 'investigation', 'mediation']).default('grievance'),
    category: z.enum(['harassment', 'discrimination', 'policy-violation', 'performance', 'conduct', 'workplace-safety', 'other']).default('other'),
    priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
    confidential: z.boolean().default(true),
    reportedBy: z.string().optional(),
    reportedByName: z.string().optional(),
    affectedEmployees: z.array(z.string()).default([]),
    description: z.string().min(1, "Description is required"),
    assignedTo: z.array(z.string()).default([]),
});

export type ERCaseFormData = z.infer<typeof erCaseSchema>;

export const profileEditSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().default("US"),
    }).optional(),
    emergencyContacts: z.array(z.object({
        name: z.string(),
        relationship: z.string(),
        phone: z.string(),
        email: z.string().optional(),
    })).default([]),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;
