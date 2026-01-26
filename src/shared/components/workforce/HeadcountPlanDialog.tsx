import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { headcountPlanSchema, type HeadcountPlanFormData } from "@/schemas/headcountPlanSchema";
import { createHeadcountPlan, updateHeadcountPlan, type HeadcountPlan } from "@/shared/lib/workforcePlanningStorage";
import { toast } from "sonner";
import { useEffect } from "react";

interface HeadcountPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingPlan?: HeadcountPlan | null;
}

export function HeadcountPlanDialog({ open, onOpenChange, onSuccess, editingPlan }: HeadcountPlanDialogProps) {
  const form = useForm<HeadcountPlanFormData>({
    resolver: zodResolver(headcountPlanSchema),
    defaultValues: {
      fiscalYear: new Date().getFullYear() + 1,
      quarter: 1,
      department: "",
      location: "",
      currentHeadcount: 0,
      plannedHeadcount: 0,
      budgetAllocated: 0,
      notes: "",
      positions: [],
    },
  });

  const onSubmit = (data: HeadcountPlanFormData) => {
    try {
      createHeadcountPlan({
        fiscalYear: data.fiscalYear,
        quarter: data.quarter,
        department: data.department,
        location: data.location,
        currentHeadcount: data.currentHeadcount,
        plannedHeadcount: data.plannedHeadcount,
        approvedHeadcount: undefined,
        budgetAllocated: data.budgetAllocated,
        budgetUsed: 0,
        positions: [],
        status: "draft",
        createdBy: "current-user",
        notes: data.notes,
      });
      toast.success("Headcount plan created successfully");
      onOpenChange(false);
      onSuccess?.();
      form.reset();
    } catch (error) {
      toast.error("Failed to create headcount plan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Headcount Plan</DialogTitle>
          <DialogDescription>Plan your workforce for the upcoming fiscal period</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fiscalYear">Fiscal Year</Label>
              <Input 
                id="fiscalYear" 
                type="number" 
                {...form.register("fiscalYear", { valueAsNumber: true })} 
              />
              {form.formState.errors.fiscalYear && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.fiscalYear.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quarter">Quarter (Optional)</Label>
              <Input 
                id="quarter" 
                type="number" 
                min="1" 
                max="4"
                {...form.register("quarter", { valueAsNumber: true })} 
                placeholder="1-4"
              />
              {form.formState.errors.quarter && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.quarter.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...form.register("department")} placeholder="Engineering" />
              {form.formState.errors.department && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.department.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input id="location" {...form.register("location")} placeholder="San Francisco" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currentHeadcount">Current Headcount</Label>
              <Input 
                id="currentHeadcount" 
                type="number" 
                {...form.register("currentHeadcount", { valueAsNumber: true })} 
              />
              {form.formState.errors.currentHeadcount && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.currentHeadcount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="plannedHeadcount">Planned Headcount</Label>
              <Input 
                id="plannedHeadcount" 
                type="number" 
                {...form.register("plannedHeadcount", { valueAsNumber: true })} 
              />
              {form.formState.errors.plannedHeadcount && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.plannedHeadcount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="budgetAllocated">Budget Allocated ($)</Label>
              <Input 
                id="budgetAllocated" 
                type="number" 
                {...form.register("budgetAllocated", { valueAsNumber: true })} 
              />
              {form.formState.errors.budgetAllocated && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.budgetAllocated.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              {...form.register("notes")} 
              placeholder="Additional planning notes..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingPlan ? "Update Plan" : "Create Plan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
