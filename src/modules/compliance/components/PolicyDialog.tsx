import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { compliancePolicySchema, type CompliancePolicyFormData } from "@/schemas/compliancePolicySchema";
import { createPolicy, updatePolicy, type CompliancePolicy } from "@/shared/lib/complianceStorage";
import { toast } from "sonner";
import { useEffect } from "react";

interface PolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingPolicy?: CompliancePolicy | null;
}

export function PolicyDialog({ open, onOpenChange, onSuccess, editingPolicy }: PolicyDialogProps) {
  const form = useForm<CompliancePolicyFormData>({
    resolver: zodResolver(compliancePolicySchema),
    defaultValues: {
      title: "",
      category: "hr",
      version: "1.0",
      effectiveDate: new Date().toISOString().split("T")[0],
      content: "",
      requiresAcknowledgment: false,
      targetAudience: "all",
    },
  });

  const onSubmit = (data: CompliancePolicyFormData) => {
    try {
      createPolicy({
        title: data.title,
        category: data.category,
        version: data.version,
        effectiveDate: data.effectiveDate,
        expiryDate: data.expiryDate,
        content: data.content,
        requiresAcknowledgment: data.requiresAcknowledgment,
        targetAudience: data.targetAudience,
        targetRoles: data.targetRoles,
        documentUrl: data.documentUrl,
        createdBy: "current-user",
      });
      toast.success("Policy created successfully");
      onOpenChange(false);
      onSuccess?.();
      form.reset();
    } catch (error) {
      toast.error("Failed to create policy");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Compliance Policy</DialogTitle>
          <DialogDescription>Add a new organizational policy</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Policy Title</Label>
            <Input id="title" {...form.register("title")} placeholder="Code of Conduct Policy" />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value: any) => form.setValue("category", value)} defaultValue="hr">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="privacy">Privacy</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="code-of-conduct">Code of Conduct</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <Input id="version" {...form.register("version")} placeholder="1.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input id="effectiveDate" type="date" {...form.register("effectiveDate")} />
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
              <Input id="expiryDate" type="date" {...form.register("expiryDate")} />
            </div>
          </div>

          <div>
            <Label htmlFor="content">Policy Content</Label>
            <Textarea id="content" {...form.register("content")} rows={6} placeholder="Enter the full policy text..." />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="documentUrl">Document URL (optional)</Label>
            <Input id="documentUrl" {...form.register("documentUrl")} placeholder="https://..." />
          </div>

          <div>
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Select onValueChange={(value: any) => form.setValue("targetAudience", value)} defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="managers">Managers Only</SelectItem>
                <SelectItem value="specific-roles">Specific Roles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Requires Acknowledgment</Label>
              <p className="text-sm text-muted-foreground">Employees must acknowledge this policy</p>
            </div>
            <Switch {...form.register("requiresAcknowledgment")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingPolicy ? "Update Policy" : "Create Policy"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
