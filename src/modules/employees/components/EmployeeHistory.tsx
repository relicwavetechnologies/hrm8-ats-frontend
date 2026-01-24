import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Plus, History, DollarSign, Briefcase } from "lucide-react";
import { EmploymentHistory } from "@/shared/types/employee";
import { getEmploymentHistory, addEmploymentHistory } from "@/shared/lib/employeeStorage";
import { format } from "date-fns";
import { toast } from "sonner";

interface EmployeeHistoryProps {
  employeeId: string;
}

export function EmployeeHistory({ employeeId }: EmployeeHistoryProps) {
  const [history, setHistory] = useState<EmploymentHistory[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    position: "",
    department: "",
    location: "",
    startDate: "",
    endDate: "",
    salary: "",
    changeReason: "",
    notes: "",
  });

  useEffect(() => {
    loadHistory();
  }, [employeeId]);

  const loadHistory = () => {
    const employeeHistory = getEmploymentHistory(employeeId);
    setHistory(employeeHistory.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    ));
  };

  const handleAdd = async () => {
    if (!formData.position || !formData.department || !formData.startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const newHistory: EmploymentHistory = {
        id: `history-${Date.now()}`,
        employeeId,
        position: formData.position,
        department: formData.department,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        salary: parseFloat(formData.salary) || 0,
        changeReason: formData.changeReason || undefined,
        notes: formData.notes || undefined,
        createdAt: new Date().toISOString(),
        createdBy: "current-user-id",
      };

      addEmploymentHistory(newHistory);
      loadHistory();
      setAddDialogOpen(false);
      setFormData({
        position: "",
        department: "",
        location: "",
        startDate: "",
        endDate: "",
        salary: "",
        changeReason: "",
        notes: "",
      });
      toast.success("History entry added successfully");
    } catch (error) {
      toast.error("Failed to add history entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employment History</CardTitle>
              <CardDescription>Track position changes and promotions</CardDescription>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No history entries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="relative pl-6 pb-4 border-l-2"
                  style={{
                    borderColor: index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                  }}
                >
                  <div
                    className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                    }}
                  />
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          {entry.position}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.department} • {entry.location}
                        </div>
                      </div>
                      {entry.salary > 0 && (
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign className="h-4 w-4" />
                          {entry.salary.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(entry.startDate), "MMM d, yyyy")}
                      {" - "}
                      {entry.endDate ? format(new Date(entry.endDate), "MMM d, yyyy") : "Present"}
                    </div>
                    {entry.changeReason && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Reason: </span>
                        {entry.changeReason}
                      </div>
                    )}
                    {entry.notes && (
                      <div className="text-sm text-muted-foreground">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add History Entry</DialogTitle>
            <DialogDescription>Record a position change or promotion</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="hist-position">Position *</Label>
              <Input
                id="hist-position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Senior Developer"
              />
            </div>
            <div>
              <Label htmlFor="hist-department">Department *</Label>
              <Input
                id="hist-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Engineering"
              />
            </div>
            <div>
              <Label htmlFor="hist-location">Location</Label>
              <Input
                id="hist-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., San Francisco"
              />
            </div>
            <div>
              <Label htmlFor="hist-salary">Salary</Label>
              <Input
                id="hist-salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g., 100000"
              />
            </div>
            <div>
              <Label htmlFor="hist-start">Start Date *</Label>
              <Input
                id="hist-start"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="hist-end">End Date</Label>
              <Input
                id="hist-end"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="hist-reason">Change Reason</Label>
              <Input
                id="hist-reason"
                value={formData.changeReason}
                onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
                placeholder="e.g., Promotion, Transfer, etc."
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="hist-notes">Notes</Label>
              <Textarea
                id="hist-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "Saving..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
