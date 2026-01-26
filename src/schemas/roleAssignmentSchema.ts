import { z } from "zod";

export const roleAssignmentSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.enum(["super_admin", "hr_admin", "hr_manager", "department_head", "manager", "employee", "contractor", "viewer"]),
  departmentId: z.string().optional(),
  expiresAt: z.string().optional(),
}).refine((data) => {
  if ((data.role === "manager" || data.role === "department_head") && !data.departmentId) {
    return false;
  }
  return true;
}, {
  message: "Department is required for managers and department heads",
  path: ["departmentId"],
});

export type RoleAssignmentFormData = z.infer<typeof roleAssignmentSchema>;
