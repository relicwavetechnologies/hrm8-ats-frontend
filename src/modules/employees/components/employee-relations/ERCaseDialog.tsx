import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { erCaseSchema, type ERCaseFormData } from "@/schemas/employeeSchemas";
import { createERCase, updateERCase, type ERCase } from "@/shared/lib/employeeRelationsStorage";
import { getEmployees } from "@/shared/lib/employeeStorage";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ERCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingCase?: ERCase | null;
}

export function ERCaseDialog({ open, onOpenChange, onSuccess, editingCase }: ERCaseDialogProps) {
  const employees = getEmployees();
  const [selectedAffected, setSelectedAffected] = useState<string[]>([]);
  const [selectedInvestigators, setSelectedInvestigators] = useState<string[]>([]);

  const form = useForm<ERCaseFormData>({
    resolver: zodResolver(erCaseSchema),
    defaultValues: {
      type: "grievance",
      category: "other",
      priority: "medium",
      confidential: true,
      affectedEmployees: [],
      description: "",
      assignedTo: [],
    },
  });

  useEffect(() => {
    if (editingCase && open) {
      form.reset({
        type: editingCase.type,
        category: editingCase.category,
        priority: editingCase.priority,
        reportedBy: editingCase.reportedBy,
        reportedByName: editingCase.reportedByName,
        affectedEmployees: editingCase.affectedEmployees,
        description: editingCase.description,
        confidential: editingCase.confidential,
        assignedTo: editingCase.assignedTo,
      });
      setSelectedAffected(editingCase.affectedEmployees || []);
      setSelectedInvestigators(editingCase.assignedTo || []);
    } else if (!open) {
      form.reset();
      setSelectedAffected([]);
      setSelectedInvestigators([]);
    }
  }, [editingCase, open, form]);

  const onSubmit = (data: ERCaseFormData) => {
    try {
      if (editingCase) {
        updateERCase(editingCase.id, {
          ...data,
          affectedEmployees: selectedAffected,
          assignedTo: selectedInvestigators,
        });
        toast.success("ER case updated successfully");
      } else {
        createERCase({
          type: data.type!,
          category: data.category!,
          priority: data.priority!,
          status: "open",
          confidential: data.confidential!,
          reportedBy: data.reportedBy,
          reportedByName: data.reportedByName,
          affectedEmployees: selectedAffected,
          description: data.description!,
          openedDate: new Date().toISOString().split("T")[0],
          assignedTo: selectedInvestigators,
          accessControlList: [...selectedInvestigators, data.reportedBy || ""].filter(Boolean) as string[],
        });
        toast.success("ER case created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
      form.reset();
      setSelectedAffected([]);
      setSelectedInvestigators([]);
    } catch (error) {
      toast.error(editingCase ? "Failed to update ER case" : "Failed to create ER case");
    }
  };

  const addAffectedEmployee = (employeeId: string) => {
    if (!selectedAffected.includes(employeeId)) {
      const newAffected = [...selectedAffected, employeeId];
      setSelectedAffected(newAffected);
      form.setValue("affectedEmployees", newAffected);
    }
  };

  const removeAffectedEmployee = (employeeId: string) => {
    const newAffected = selectedAffected.filter(id => id !== employeeId);
    setSelectedAffected(newAffected);
    form.setValue("affectedEmployees", newAffected);
  };

  const addInvestigator = (employeeId: string) => {
    if (!selectedInvestigators.includes(employeeId)) {
      const newInvestigators = [...selectedInvestigators, employeeId];
      setSelectedInvestigators(newInvestigators);
      form.setValue("assignedTo", newInvestigators);
    }
  };

  const removeInvestigator = (employeeId: string) => {
    const newInvestigators = selectedInvestigators.filter(id => id !== employeeId);
    setSelectedInvestigators(newInvestigators);
    form.setValue("assignedTo", newInvestigators);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCase ? "Edit ER Case" : "Create ER Case"}</DialogTitle>
          <DialogDescription>Document and track an employee relations issue</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Case Type</Label>
              <Select onValueChange={(value: any) => form.setValue("type", value)} defaultValue="grievance">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grievance">Grievance</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="disciplinary">Disciplinary</SelectItem>
                  <SelectItem value="investigation">Investigation</SelectItem>
                  <SelectItem value="mediation">Mediation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value: any) => form.setValue("category", value)} defaultValue="other">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="discrimination">Discrimination</SelectItem>
                  <SelectItem value="policy-violation">Policy Violation</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="conduct">Conduct</SelectItem>
                  <SelectItem value="workplace-safety">Workplace Safety</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={(value: any) => form.setValue("priority", value)} defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="confidential">Confidential</Label>
              <Switch
                id="confidential"
                checked={form.watch("confidential")}
                onCheckedChange={(checked) => form.setValue("confidential", checked)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportedBy">Reporter ID (Optional)</Label>
              <Input id="reportedBy" {...form.register("reportedBy")} placeholder="Employee ID" />
            </div>

            <div>
              <Label htmlFor="reportedByName">Reporter Name (Optional)</Label>
              <Input id="reportedByName" {...form.register("reportedByName")} placeholder="Reporter's name" />
            </div>
          </div>

          <div>
            <Label>Affected Employees</Label>
            <Select onValueChange={addAffectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select affected employees" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.affectedEmployees && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.affectedEmployees.message}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedAffected.map(id => {
                const emp = employees.find(e => e.id === id);
                return emp ? (
                  <div key={id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                    {emp.firstName} {emp.lastName}
                    <Button type="button" variant="ghost" size="icon" className="h-4 w-4 p-0 ml-0.5 hover:text-destructive hover:bg-transparent" onClick={() => removeAffectedEmployee(id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div>
            <Label>Assign Investigators</Label>
            <Select onValueChange={addInvestigator}>
              <SelectTrigger>
                <SelectValue placeholder="Select investigators" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.assignedTo && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.assignedTo.message}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedInvestigators.map(id => {
                const emp = employees.find(e => e.id === id);
                return emp ? (
                  <div key={id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                    {emp.firstName} {emp.lastName}
                    <Button type="button" variant="ghost" size="icon" className="h-4 w-4 p-0 ml-0.5 hover:text-destructive hover:bg-transparent" onClick={() => removeInvestigator(id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Case Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Detailed description of the case..."
              rows={6}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingCase ? "Update Case" : "Create Case"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
