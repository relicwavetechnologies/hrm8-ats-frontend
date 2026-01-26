import { z } from "zod";

export const compliancePolicySchema = z.object({
  title: z.string().min(1, "Policy title is required").max(200),
  category: z.enum(["privacy", "security", "hr", "code-of-conduct", "safety", "other"]),
  version: z.string().min(1, "Version is required").max(20),
  effectiveDate: z.string().min(1, "Effective date is required"),
  expiryDate: z.string().optional(),
  content: z.string().min(10, "Policy content is required"),
  requiresAcknowledgment: z.boolean().default(false),
  targetAudience: z.enum(["all", "managers", "specific-roles"]).default("all"),
  targetRoles: z.array(z.string()).optional(),
  documentUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
}).refine((data) => {
  if (data.targetAudience === "specific-roles" && (!data.targetRoles || data.targetRoles.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Target roles must be specified when audience is specific-roles",
  path: ["targetRoles"],
});

export type CompliancePolicyFormData = z.infer<typeof compliancePolicySchema>;
