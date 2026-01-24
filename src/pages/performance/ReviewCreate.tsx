import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { savePerformanceReview, getReviewTemplates } from "@/shared/lib/performanceStorage";
import { toast } from "sonner";
import type { PerformanceReview, ReviewStatus, ApprovalStage } from "@/shared/types/performance";

export default function ReviewCreate() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const templates = useMemo(() => getReviewTemplates(), []);

  const [formData, setFormData] = useState({
    employeeId: "EMP001",
    employeeName: "John Doe",
    reviewerId: "MGR001",
    reviewerName: "Jane Smith",
    templateId: "",
    reviewPeriodStart: "",
    reviewPeriodEnd: "",
    status: "not-started" as ReviewStatus,
    dueDate: "",
  });

  const [enableApprovalWorkflow, setEnableApprovalWorkflow] = useState(false);
  const [approvalStages, setApprovalStages] = useState<Omit<ApprovalStage, 'id'>[]>([
    {
      name: "Manager Approval",
      role: "manager",
      status: "pending",
      required: true,
    }
  ]);

  const handleAddApprovalStage = () => {
    setApprovalStages([
      ...approvalStages,
      {
        name: "Additional Approval",
        role: "hr",
        status: "pending",
        required: false,
      }
    ]);
  };

  const handleRemoveApprovalStage = (index: number) => {
    setApprovalStages(approvalStages.filter((_, i) => i !== index));
  };

  const handleStageChange = (index: number, field: keyof Omit<ApprovalStage, 'id'>, value: any) => {
    const updated = [...approvalStages];
    updated[index] = { ...updated[index], [field]: value };
    setApprovalStages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.templateId || !formData.reviewPeriodStart || !formData.reviewPeriodEnd || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const template = templates.find(t => t.id === formData.templateId);
      
      const newReview: PerformanceReview = {
        id: `REV-${Date.now()}`,
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        reviewerId: formData.reviewerId,
        reviewerName: formData.reviewerName,
        templateId: formData.templateId,
        templateName: template?.name || "Unknown Template",
        reviewPeriodStart: new Date(formData.reviewPeriodStart).toISOString(),
        reviewPeriodEnd: new Date(formData.reviewPeriodEnd).toISOString(),
        status: formData.status,
        dueDate: new Date(formData.dueDate).toISOString(),
        responses: [],
        approvalWorkflow: enableApprovalWorkflow ? {
          stages: approvalStages.map((stage, index) => ({
            ...stage,
            id: `STAGE-${Date.now()}-${index}`,
          })),
          currentStageIndex: 0,
          overallStatus: 'pending',
        } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      savePerformanceReview(newReview);
      toast.success("Performance review created successfully");
      navigate('/performance');
    } catch (error) {
      toast.error("Failed to create review");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Create Performance Review</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/performance')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Performance Review</h1>
              <p className="text-muted-foreground">Set up a new performance review for an employee</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Review Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template">Review Template *</Label>
                    <Select
                      value={formData.templateId}
                      onValueChange={(value) => setFormData({ ...formData, templateId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.cycle})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose the evaluation template for this review
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reviewPeriodStart">Review Period Start *</Label>
                      <Input
                        id="reviewPeriodStart"
                        type="date"
                        value={formData.reviewPeriodStart}
                        onChange={(e) => setFormData({ ...formData, reviewPeriodStart: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reviewPeriodEnd">Review Period End *</Label>
                      <Input
                        id="reviewPeriodEnd"
                        type="date"
                        value={formData.reviewPeriodEnd}
                        onChange={(e) => setFormData({ ...formData, reviewPeriodEnd: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      When should this review be completed by?
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Workflow */}
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Approval Workflow</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Optional multi-stage approval process
                      </p>
                    </div>
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Checkbox
                        checked={enableApprovalWorkflow}
                        onCheckedChange={(checked) => setEnableApprovalWorkflow(checked as boolean)}
                      />
                      <Label>Enable Workflow</Label>
                    </div>
                  </div>
                </CardHeader>
                {enableApprovalWorkflow && (
                  <CardContent className="space-y-4">
                    {approvalStages.map((stage, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="text-base font-semibold flex items-center justify-between">
                          <h4 className="font-semibold">Stage {index + 1}</h4>
                          {approvalStages.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveApprovalStage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Stage Name</Label>
                            <Input
                              value={stage.name}
                              onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                              placeholder="e.g., Manager Approval"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                              value={stage.role}
                              onValueChange={(value: any) => handleStageChange(index, 'role', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="hr">HR</SelectItem>
                                <SelectItem value="senior-manager">Senior Manager</SelectItem>
                                <SelectItem value="executive">Executive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="text-base font-semibold flex items-center gap-2">
                          <Checkbox
                            checked={stage.required}
                            onCheckedChange={(checked) => handleStageChange(index, 'required', checked)}
                          />
                          <Label className="text-sm">Required approval</Label>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={handleAddApprovalStage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Approval Stage
                    </Button>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Employee</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Employee Name</Label>
                    <Select
                      value={formData.employeeName}
                      onValueChange={(value) => setFormData({ ...formData, employeeName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Doe">John Doe</SelectItem>
                        <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Reviewer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reviewer Name</Label>
                    <Select
                      value={formData.reviewerName}
                      onValueChange={(value) => setFormData({ ...formData, reviewerName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jane Smith">Jane Smith (Manager)</SelectItem>
                        <SelectItem value="Bob Wilson">Bob Wilson (Director)</SelectItem>
                        <SelectItem value="Sarah Lee">Sarah Lee (HR Manager)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.status}
                    onValueChange={(value: ReviewStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Creating..." : "Create Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/performance')}
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
