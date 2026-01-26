import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { lifeEventSchema, type LifeEventFormData } from "@/schemas/benefitsSchemas";
import { createLifeEvent, updateLifeEvent, type LifeEvent } from "@/shared/lib/benefitsEnhancedStorage";
import { toast } from "sonner";
import { useEffect } from "react";

interface LifeEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingEvent?: LifeEvent | null;
}

export function LifeEventDialog({ open, onOpenChange, onSuccess, editingEvent }: LifeEventDialogProps) {
  const form = useForm<LifeEventFormData>({
    resolver: zodResolver(lifeEventSchema),
    defaultValues: {
      employeeId: "",
      employeeName: "",
      eventType: "marriage",
      eventDate: new Date().toISOString().split("T")[0],
      documentationReceived: false,
      specialEnrollmentPeriod: 30,
      processed: false,
      affectedDependents: [],
    },
  });

  const onSubmit = (data: LifeEventFormData) => {
    try {
      createLifeEvent({
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        eventType: data.eventType === 'loss-coverage' ? 'loss-of-coverage' : (data.eventType === 'other' ? 'loss-of-coverage' : data.eventType),
        eventDate: data.eventDate,
        documentationRequired: true,
        documentationReceived: data.documentationReceived,
        specialEnrollmentPeriod: data.specialEnrollmentPeriod,
        notes: data.notes || "",
        processed: data.processed,
      });
      toast.success("Life event recorded successfully");
      onOpenChange(false);
      onSuccess?.();
      form.reset();
    } catch (error) {
      toast.error("Failed to record life event");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Life Event</DialogTitle>
          <DialogDescription>Document a qualifying life event for special enrollment</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {form.formState.errors.employeeName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.employeeName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select onValueChange={(value: any) => form.setValue("eventType", value)} defaultValue="marriage">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marriage">Marriage</SelectItem>
                  <SelectItem value="divorce">Divorce</SelectItem>
                  <SelectItem value="birth">Birth</SelectItem>
                  <SelectItem value="adoption">Adoption</SelectItem>
                  <SelectItem value="death">Death</SelectItem>
                  <SelectItem value="loss-coverage">Loss of Coverage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" type="date" {...form.register("eventDate")} />
              {form.formState.errors.eventDate && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.eventDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="specialEnrollmentPeriod">Special Enrollment Period (days)</Label>
            <Input id="specialEnrollmentPeriod" type="number" {...form.register("specialEnrollmentPeriod", { valueAsNumber: true })} />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} placeholder="Additional details..." />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Documentation Received</Label>
              <p className="text-sm text-muted-foreground">Verify supporting documents</p>
            </div>
            <Switch {...form.register("documentationReceived")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingEvent ? "Update Event" : "Record Event"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
