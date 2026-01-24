import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { dataSubjectRequestSchema, type DataSubjectRequestFormData } from "@/schemas/dataSubjectRequestSchema";
import { createDataSubjectRequest, updateDataSubjectRequest, type DataSubjectRequest } from "@/shared/lib/complianceStorage";
import { toast } from "sonner";
import { useEffect } from "react";

interface DataSubjectRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingRequest?: DataSubjectRequest | null;
}

export function DataSubjectRequestDialog({ open, onOpenChange, onSuccess, editingRequest }: DataSubjectRequestDialogProps) {
  const form = useForm<DataSubjectRequestFormData>({
    resolver: zodResolver(dataSubjectRequestSchema),
    defaultValues: {
      type: "access",
      employeeId: "",
      employeeName: "",
      requestDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  });

  const onSubmit = (data: DataSubjectRequestFormData) => {
    try {
      createDataSubjectRequest({
        type: data.type,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        assignedTo: data.assignedTo,
        notes: data.notes,
      });
      toast.success("Data subject request created successfully");
      onOpenChange(false);
      onSuccess?.();
      form.reset();
    } catch (error) {
      toast.error("Failed to create request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Data Subject Request</DialogTitle>
          <DialogDescription>Process GDPR data subject rights request</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="type">Request Type</Label>
            <Select onValueChange={(value: any) => form.setValue("type", value)} defaultValue="access">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="access">Right to Access</SelectItem>
                <SelectItem value="deletion">Right to Deletion</SelectItem>
                <SelectItem value="correction">Right to Correction</SelectItem>
                <SelectItem value="portability">Right to Data Portability</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" {...form.register("employeeId")} placeholder="EMP-001" />
              {form.formState.errors.employeeId && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.employeeId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input id="employeeName" {...form.register("employeeName")} placeholder="John Doe" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestDate">Request Date</Label>
              <Input id="requestDate" type="date" {...form.register("requestDate")} />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...form.register("dueDate")} />
              {form.formState.errors.dueDate && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assigned To (optional)</Label>
            <Input id="assignedTo" {...form.register("assignedTo")} placeholder="User ID" />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} placeholder="Additional details..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingRequest ? "Update Request" : "Create Request"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
