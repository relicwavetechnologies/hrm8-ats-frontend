import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { roleAssignmentSchema, type RoleAssignmentFormData } from "@/schemas/roleAssignmentSchema";
import { createRoleAssignment, updateRoleAssignment, type RoleAssignment } from "@/shared/lib/rbacStorage";
import { getEmployees } from "@/shared/lib/employeeStorage";
import { toast } from "sonner";
import { useEffect } from "react";

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingAssignment?: RoleAssignment | null;
}

export function RoleAssignmentDialog({ open, onOpenChange, onSuccess, editingAssignment }: RoleAssignmentDialogProps) {
  const employees = getEmployees();

  const form = useForm<RoleAssignmentFormData>({
    resolver: zodResolver(roleAssignmentSchema),
    defaultValues: {
      userId: "",
      role: "employee",
      departmentId: "",
      expiresAt: "",
    },
  });

  const selectedRole = form.watch("role");

  useEffect(() => {
    if (editingAssignment && open) {
      form.reset({
        userId: editingAssignment.userId,
        role: editingAssignment.role,
        departmentId: editingAssignment.departmentId || "",
        expiresAt: editingAssignment.expiresAt || "",
      });
    } else if (!open) {
      form.reset();
    }
  }, [editingAssignment, open, form]);

  const onSubmit = (data: RoleAssignmentFormData) => {
    try {
      const user = employees.find(e => e.id === data.userId);
      if (editingAssignment) {
        updateRoleAssignment(editingAssignment.id, {
          ...data,
          userName: user ? `${user.firstName} ${user.lastName}` : editingAssignment.userName,
          departmentName: data.departmentId ? user?.department : undefined,
        });
        toast.success("Role updated successfully");
      } else {
        createRoleAssignment({
          userId: data.userId,
          userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
          role: data.role,
          departmentId: data.departmentId,
          departmentName: data.departmentId ? user?.department : undefined,
          assignedBy: "current-user",
          expiresAt: data.expiresAt,
        });
        toast.success("Role assigned successfully");
      }
      onOpenChange(false);
      onSuccess?.();
      form.reset();
    } catch (error) {
      toast.error(editingAssignment ? "Failed to update role" : "Failed to assign role");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingAssignment ? "Edit Role Assignment" : "Assign Role"}</DialogTitle>
          <DialogDescription>Grant a user access and permissions in the system</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="userId">User</Label>
            <Select onValueChange={(value) => form.setValue("userId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.userId && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.userId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value: any) => form.setValue("role", value)} defaultValue="employee">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="hr_admin">HR Admin</SelectItem>
                <SelectItem value="hr_manager">HR Manager</SelectItem>
                <SelectItem value="department_head">Department Head</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>
            )}
          </div>

          {(selectedRole === "manager" || selectedRole === "department_head") && (
            <div>
              <Label htmlFor="departmentId">Department</Label>
              <Input 
                id="departmentId" 
                {...form.register("departmentId")} 
                placeholder="Department ID or name"
              />
              {form.formState.errors.departmentId && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.departmentId.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <Input 
              id="expiresAt" 
              type="date" 
              {...form.register("expiresAt")}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <h4 className="font-medium mb-2">Role Permissions:</h4>
            {selectedRole === "super_admin" && <p>Full system access and configuration</p>}
            {selectedRole === "hr_admin" && <p>Manage employees, benefits, and HR operations</p>}
            {selectedRole === "hr_manager" && <p>HR operations and reporting</p>}
            {selectedRole === "department_head" && <p>Department-level people management</p>}
            {selectedRole === "employee" && <p>Access personal information and submit requests</p>}
            {selectedRole === "viewer" && <p>Read-only access to allowed modules</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingAssignment ? "Update Role" : "Assign Role"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
