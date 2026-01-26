import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { cobraSchema, type COBRAFormData } from "@/schemas/benefitsSchemas";
import { createCOBRAEvent, updateCOBRAEvent, type COBRAEvent } from "@/shared/lib/benefitsEnhancedStorage";
import { toast } from "sonner";
import { useEffect } from "react";

interface COBRADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingEvent?: COBRAEvent | null;
}

export function COBRADialog({ open, onOpenChange, onSuccess, editingEvent }: COBRADialogProps) {
  const form = useForm<COBRAFormData>({
    resolver: zodResolver(cobraSchema),
    defaultValues: {
      employeeId: "",
      employeeName: "",
      qualifyingEvent: "termination",
      eventDate: new Date().toISOString().split("T")[0],
      notificationDate: new Date().toISOString().split("T")[0],
      electionDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      cobraStartDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      maxCoverageDuration: 18,
      premiumAmount: 0,
      administrativeFee: 2,
      status: "pending",
      coverageElected: false,
    },
  });

  const onSubmit = (data: COBRAFormData) => {
    try {
      createCOBRAEvent({
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        qualifyingEvent: data.qualifyingEvent === 'loss-dependent' ? 'termination' : (data.qualifyingEvent === 'medicare' ? 'medicare-eligible' : data.qualifyingEvent),
        eventDate: data.eventDate,
        notificationDate: data.notificationDate,
        notificationSent: true,
        elected: data.coverageElected,
        electionDate: data.coverageElected ? new Date().toISOString() : undefined,
        cobraStartDate: data.cobraStartDate,
        coverageEndDate: data.eventDate,
        cobraEndDate: new Date(new Date(data.cobraStartDate).setMonth(new Date(data.cobraStartDate).getMonth() + data.maxCoverageDuration)).toISOString(),
        premiumAmount: data.premiumAmount + data.administrativeFee,
        status: data.status,
      });
      toast.success("COBRA event created successfully");
      onOpenChange(false);
      onSuccess?.();
      form.reset();
    } catch (error) {
      toast.error("Failed to create COBRA event");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create COBRA Event</DialogTitle>
          <DialogDescription>Set up COBRA continuation coverage</DialogDescription>
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
            </div>
          </div>

          <div>
            <Label htmlFor="qualifyingEvent">Qualifying Event</Label>
            <Select onValueChange={(value: any) => form.setValue("qualifyingEvent", value)} defaultValue="termination">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="termination">Termination</SelectItem>
                <SelectItem value="reduction-hours">Reduction of Hours</SelectItem>
                <SelectItem value="death">Death</SelectItem>
                <SelectItem value="divorce">Divorce</SelectItem>
                <SelectItem value="loss-dependent">Loss of Dependent Status</SelectItem>
                <SelectItem value="medicare">Medicare Entitlement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" type="date" {...form.register("eventDate")} />
            </div>

            <div>
              <Label htmlFor="notificationDate">Notification Date</Label>
              <Input id="notificationDate" type="date" {...form.register("notificationDate")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="electionDeadline">Election Deadline</Label>
              <Input id="electionDeadline" type="date" {...form.register("electionDeadline")} />
            </div>

            <div>
              <Label htmlFor="cobraStartDate">COBRA Start Date</Label>
              <Input id="cobraStartDate" type="date" {...form.register("cobraStartDate")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="maxCoverageDuration">Max Duration (months)</Label>
              <Input id="maxCoverageDuration" type="number" {...form.register("maxCoverageDuration", { valueAsNumber: true })} />
            </div>

            <div>
              <Label htmlFor="premiumAmount">Premium Amount</Label>
              <Input id="premiumAmount" type="number" step="0.01" {...form.register("premiumAmount", { valueAsNumber: true })} />
            </div>

            <div>
              <Label htmlFor="administrativeFee">Admin Fee (%)</Label>
              <Input id="administrativeFee" type="number" step="0.1" {...form.register("administrativeFee", { valueAsNumber: true })} />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} placeholder="Additional information..." />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Coverage Elected</Label>
              <p className="text-sm text-muted-foreground">Employee elected COBRA coverage</p>
            </div>
            <Switch {...form.register("coverageElected")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingEvent ? "Update Event" : "Create COBRA Event"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
