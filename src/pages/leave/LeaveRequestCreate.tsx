import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Save, Upload, Calendar } from "lucide-react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { saveLeaveRequest, getLeaveTypes } from "@/shared/lib/leaveStorage";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";
import type { LeaveRequest, LeaveApproval } from "@/shared/types/leave";

export default function LeaveRequestCreate() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const leaveTypes = useMemo(() => getLeaveTypes(), []);

  const [formData, setFormData] = useState({
    employeeId: "EMP001",
    employeeName: "John Doe",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const selectedLeaveType = leaveTypes.find(t => t.id === formData.leaveTypeId);
  const totalDays = formData.startDate && formData.endDate 
    ? differenceInDays(new Date(formData.endDate), new Date(formData.startDate)) + 1
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (totalDays <= 0) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSaving(true);
    try {
      const leaveRequestId = `LR-${Date.now()}`;
      
      const approvalWorkflow: LeaveApproval[] = [
        {
          id: `APPR-${Date.now()}-1`,
          leaveRequestId: leaveRequestId,
          level: 1,
          approverRole: "Manager",
          approverId: "MGR001",
          approverName: "Jane Smith",
          status: "pending",
          isRequired: true,
        },
        {
          id: `APPR-${Date.now()}-2`,
          leaveRequestId: leaveRequestId,
          level: 2,
          approverRole: "HR",
          approverId: "HR001",
          approverName: "HR Manager",
          status: "pending",
          isRequired: false,
        },
      ];

      const newLeaveRequest: LeaveRequest = {
        id: leaveRequestId,
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        leaveTypeId: formData.leaveTypeId,
        leaveTypeName: selectedLeaveType?.name || "Unknown",
        leaveTypeColor: selectedLeaveType?.color || "#gray",
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        totalDays: totalDays,
        reason: formData.reason,
        status: 'pending',
        approvalWorkflow: approvalWorkflow,
        currentApprovalLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };

      saveLeaveRequest(newLeaveRequest);
      toast.success("Leave request submitted successfully");
      navigate('/leave');
    } catch (error) {
      toast.error("Failed to submit leave request");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Request Leave</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/leave')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Request Leave</h1>
              <p className="text-muted-foreground">Submit a new leave request</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Leave Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type *</Label>
                    <Select
                      value={formData.leaveTypeId}
                      onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="text-base font-semibold flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: type.color }}
                              />
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLeaveType && (
                      <p className="text-xs text-muted-foreground">
                        {selectedLeaveType.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {totalDays > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Total Days:</span>
                        <span>{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      rows={4}
                      placeholder="Please provide a reason for your leave request..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Attachments (Optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload supporting documents
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Employee Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name</span>
                    <p className="font-medium">{formData.employeeName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employee ID</span>
                    <p className="font-medium">{formData.employeeId}</p>
                  </div>
                </CardContent>
              </Card>

              {selectedLeaveType && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Leave Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="text-base font-semibold flex items-center justify-between">
                      <span className="text-muted-foreground">Available</span>
                      <span className="font-medium">15 days</span>
                    </div>
                    <div className="text-base font-semibold flex items-center justify-between">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-medium">2 days</span>
                    </div>
                    {totalDays > 0 && (
                      <div className="pt-3 border-t">
                        <div className="text-base font-semibold flex items-center justify-between">
                          <span className="text-muted-foreground">After Request</span>
                          <span className="font-medium">{15 - totalDays} days</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Approval Workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>Manager Approval</span>
                      <span className="text-xs text-muted-foreground">Required</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>HR Approval</span>
                      <span className="text-xs text-muted-foreground">If &gt; 5 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/leave')}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardPageLayout>
  );
}
