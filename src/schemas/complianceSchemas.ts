import { z } from "zod";

export const dataSubjectRequestSchema = z.object({
    type: z.enum(['access', 'erasure', 'rectification', 'portability', 'deletion', 'correction']),
    employeeId: z.string().min(1, "Employee is required"),
    employeeName: z.string().min(1, "Employee name is required"),
    requestDate: z.string().min(1, "Request date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    assignedTo: z.string().optional(),
    notes: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    description: z.string().optional(),
});

export type DataSubjectRequestFormData = z.infer<typeof dataSubjectRequestSchema>;

export const compliancePolicySchema = z.object({
    title: z.string().min(1, "Title is required"),
    category: z.string().min(1, "Category is required"),
    version: z.string().min(1, "Version is required"),
    effectiveDate: z.string().min(1, "Effective date is required"),
    expiryDate: z.string().optional(),
    description: z.string().optional(),
    content: z.string().min(1, "Content is required"),
    requiresAcknowledgment: z.boolean().default(false),
    targetAudience: z.enum(['all', 'managers', 'specific-roles']).default('all'),
    targetRoles: z.array(z.string()).optional(),
    documentUrl: z.string().optional(),
    status: z.enum(['draft', 'active', 'archived']).default('active'),
});

export type CompliancePolicyFormData = z.infer<typeof compliancePolicySchema>;
