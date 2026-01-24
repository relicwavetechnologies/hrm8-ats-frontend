import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { accrualPolicySchema, type AccrualPolicyFormData } from "@/schemas/accrualPolicySchema";
import { createAccrualPolicy, updateAccrualPolicy, type AccrualPolicy } from "@/lib/accrualStorage";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface AccrualPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingPolicy?: AccrualPolicy | null;
}

export function AccrualPolicyDialog({ open, onOpenChange, onSuccess, editingPolicy }: AccrualPolicyDialogProps) {
  const [tenureRates, setTenureRates] = useState<Array<{ yearsFrom: number; yearsTo?: number; accrualRate: number }>>([]);
  
  const form = useForm<AccrualPolicyFormData>({
    resolver: zodResolver(accrualPolicySchema),
    defaultValues: {
      name: "",
      leaveTypeId: "pto",
      leaveTypeName: "PTO",
      accrualMethod: "monthly",
      accrualRate: 1.25,
      accrualFrequency: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      prorateFirstYear: true,
      prorateLastYear: false,
      carryoverAllowed: true,
      negativeBalanceAllowed: false,
      tenureBasedRates: [],
      effectiveDate: new Date().toISOString().split("T")[0],
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingPolicy && open) {
      form.reset({
        name: editingPolicy.name,
        leaveTypeId: editingPolicy.leaveTypeId,
        leaveTypeName: editingPolicy.leaveTypeName,
        accrualMethod: editingPolicy.accrualMethod,
        accrualRate: editingPolicy.accrualRate,
        accrualFrequency: editingPolicy.accrualFrequency,
        startDate: editingPolicy.startDate,
        prorateFirstYear: editingPolicy.prorateFirstYear,
        prorateLastYear: editingPolicy.prorateLastYear,
        maxAccrual: editingPolicy.maxAccrual,
        carryoverAllowed: editingPolicy.carryoverAllowed,
        maxCarryover: editingPolicy.maxCarryover,
        negativeBalanceAllowed: editingPolicy.negativeBalanceAllowed,
        effectiveDate: editingPolicy.effectiveDate,
      });
      setTenureRates(editingPolicy.tenureBasedRates);
    } else if (!open) {
      form.reset();
      setTenureRates([]);
    }
  }, [editingPolicy, open, form]);

  const onSubmit = (data: AccrualPolicyFormData) => {
    try {
      if (editingPolicy) {
        updateAccrualPolicy(editingPolicy.id, {
          ...data,
          tenureBasedRates: tenureRates,
        });
        toast.success("Accrual policy updated successfully");
      } else {
        createAccrualPolicy({
          name: data.name!,
          leaveTypeId: data.leaveTypeId!,
          leaveTypeName: data.leaveTypeName!,
          accrualMethod: data.accrualMethod!,
          accrualRate: data.accrualRate!,
          accrualFrequency: data.accrualFrequency!,
          startDate: data.startDate!,
          prorateFirstYear: data.prorateFirstYear!,
          prorateLastYear: data.prorateLastYear!,
          maxAccrual: data.maxAccrual,
          carryoverAllowed: data.carryoverAllowed!,
          maxCarryover: data.maxCarryover,
          negativeBalanceAllowed: data.negativeBalanceAllowed!,
          tenureBasedRates: tenureRates,
          effectiveDate: data.effectiveDate!,
          isActive: true,
          createdBy: "current-user",
        });
        toast.success("Accrual policy created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
      form.reset();
      setTenureRates([]);
    } catch (error) {
      toast.error(editingPolicy ? "Failed to update accrual policy" : "Failed to create accrual policy");
    }
  };

  const addTenureRate = () => {
    setTenureRates([...tenureRates, { yearsFrom: tenureRates.length, accrualRate: 1.5 }]);
  };

  const removeTenureRate = (index: number) => {
    setTenureRates(tenureRates.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPolicy ? "Edit Accrual Policy" : "Create Accrual Policy"}</DialogTitle>
          <DialogDescription>Configure automated time-off accrual rules</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Policy Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Annual PTO Accrual" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leaveTypeName">Leave Type</Label>
              <Select onValueChange={(value) => form.setValue("leaveTypeName", value)} defaultValue="PTO">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PTO">PTO</SelectItem>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Vacation">Vacation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accrualMethod">Accrual Method</Label>
              <Select onValueChange={(value: any) => form.setValue("accrualMethod", value)} defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="per-pay-period">Per Pay Period</SelectItem>
                  <SelectItem value="hours-worked">Hours Worked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accrualRate">Accrual Rate (days)</Label>
              <Input id="accrualRate" type="number" step="0.1" {...form.register("accrualRate", { valueAsNumber: true })} />
              {form.formState.errors.accrualRate && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.accrualRate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="maxAccrual">Max Accrual (optional)</Label>
              <Input id="maxAccrual" type="number" {...form.register("maxAccrual", { valueAsNumber: true })} placeholder="Unlimited" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Carryover Allowed</Label>
              <p className="text-sm text-muted-foreground">Allow unused time to carry over</p>
            </div>
            <Switch {...form.register("carryoverAllowed")} defaultChecked />
          </div>

          {form.watch("carryoverAllowed") && (
            <div>
              <Label htmlFor="maxCarryover">Max Carryover Days</Label>
              <Input id="maxCarryover" type="number" {...form.register("maxCarryover", { valueAsNumber: true })} placeholder="Unlimited" />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Prorate First Year</Label>
              <p className="text-sm text-muted-foreground">Adjust accruals for mid-year hires</p>
            </div>
            <Switch {...form.register("prorateFirstYear")} defaultChecked />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Tenure-Based Rates</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTenureRate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rate
              </Button>
            </div>
            {tenureRates.map((rate, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input type="number" placeholder="Years from" value={rate.yearsFrom} onChange={(e) => {
                  const newRates = [...tenureRates];
                  newRates[index].yearsFrom = Number(e.target.value);
                  setTenureRates(newRates);
                }} />
                <Input type="number" placeholder="Years to (optional)" value={rate.yearsTo || ""} onChange={(e) => {
                  const newRates = [...tenureRates];
                  newRates[index].yearsTo = e.target.value ? Number(e.target.value) : undefined;
                  setTenureRates(newRates);
                }} />
                <Input type="number" step="0.1" placeholder="Rate" value={rate.accrualRate} onChange={(e) => {
                  const newRates = [...tenureRates];
                  newRates[index].accrualRate = Number(e.target.value);
                  setTenureRates(newRates);
                }} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeTenureRate(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
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
