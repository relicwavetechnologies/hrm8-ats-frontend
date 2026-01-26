import { z } from "zod";

export const rpoServiceSchema = z.object({
    name: z.string().min(1, "Service name is required"),
    clientId: z.string().optional(),
    clientName: z.string().min(1, "Client name is required"),
    location: z.string().min(1, "Location is required"),
    country: z.string().default("United States"),
    serviceType: z.enum(['self-managed', 'shortlisting', 'full-service', 'executive-search', 'rpo']).default('rpo'),
    hiringVolume: z.number().min(1, "Hiring volume is required").default(10),
    averageSalary: z.number().min(0, "Average salary is required").default(0),
    urgency: z.enum(['low', 'medium', 'high']).default('medium'),
    additionalServices: z.array(z.string()).default([]),
    rpoStartDate: z.string().min(1, "Start date is required"),
    rpoDuration: z.number().min(1, "Duration is required").default(12),
    rpoNumberOfConsultants: z.number().min(1, "Number of consultants is required").default(1),
    rpoMonthlyRatePerConsultant: z.number().min(0).default(0),
    rpoPerVacancyFee: z.number().min(0).default(0),
    rpoEstimatedVacancies: z.number().min(0).default(10),
    rpoIsCustomPricing: z.boolean().default(false),
    rpoFeeStructures: z.array(z.any()).default([]),
    rpoAssignedConsultants: z.array(z.string()).default([]),
    rpoAutoRenew: z.boolean().default(false),
    rpoNoticePeriod: z.number().min(0).default(30),
    targetPlacements: z.number().optional(),
    rpoPrimaryContactId: z.string().optional(),
    rpoAdditionalContactIds: z.array(z.string()).default([]),
    rpoNotes: z.string().optional(),
    description: z.string().optional(),
});

export type RPOServiceFormData = z.infer<typeof rpoServiceSchema>;
