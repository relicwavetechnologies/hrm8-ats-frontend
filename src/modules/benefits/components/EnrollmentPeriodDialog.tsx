import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { enrollmentPeriodSchema, type EnrollmentPeriodFormData } from "@/schemas/enrollmentPeriodSchema";
import { createEnrollmentPeriod, updateEnrollmentPeriod, type EnrollmentPeriod } from "@/shared/lib/benefitsEnhancedStorage";
import { toast } from "sonner";
import { useEffect } from "react";

interface EnrollmentPeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingPeriod?: EnrollmentPeriod | null;
}

export function EnrollmentPeriodDialog({ open, onOpenChange, onSuccess, editingPeriod }: EnrollmentPeriodDialogProps) {
  const form = useForm<EnrollmentPeriodFormData>({
    resolver: zodResolver(enrollmentPeriodSchema),
    defaultValues: {
      name: "",
      type: "open",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      effectiveDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      eligiblePlanIds: [],
      notificationDays: 30,
      autoEnroll: false,
      reminderFrequency: "weekly",
      status: "upcoming",
    },
  });

  const onSubmit = (data: EnrollmentPeriodFormData) => {
    try {
      createEnrollmentPeriod({
        name: data.name,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        effectiveDate: data.effectiveDate,
      eligiblePlans: data.eligiblePlanIds,
        notifications: [],
        status: data.status,
      });
      toast.success("Enrollment period created successfully");
      onOpenChange(false);
      onSuccess?.();
      form.reset();
    } catch (error) {
      toast.error("Failed to create enrollment period");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Enrollment Period</DialogTitle>
          <DialogDescription>Set up a new benefits enrollment period</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Period Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Open Enrollment 2025" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Enrollment Type</Label>
            <Select onValueChange={(value: any) => form.setValue("type", value)} defaultValue="open">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open Enrollment</SelectItem>
                <SelectItem value="new-hire">New Hire</SelectItem>
                <SelectItem value="life-event">Life Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
              {form.formState.errors.startDate && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
              {form.formState.errors.endDate && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.endDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input id="effectiveDate" type="date" {...form.register("effectiveDate")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notificationDays">Notification Days</Label>
              <Input id="notificationDays" type="number" {...form.register("notificationDays", { valueAsNumber: true })} />
            </div>

            <div>
              <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
              <Select onValueChange={(value: any) => form.setValue("reminderFrequency", value)} defaultValue="weekly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Auto-Enroll</Label>
              <p className="text-sm text-muted-foreground">Automatically enroll eligible employees</p>
            </div>
            <Switch {...form.register("autoEnroll")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Period</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
