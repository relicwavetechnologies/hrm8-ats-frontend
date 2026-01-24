import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { savePerformanceGoal } from "@/shared/lib/performanceStorage";
import { toast } from "sonner";
import type { PerformanceGoal, GoalStatus, GoalPriority, GoalKPI } from "@/shared/types/performance";

export default function GoalCreate() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: "EMP001",
    employeeName: "John Doe",
    title: "",
    description: "",
    category: "",
    priority: "medium" as GoalPriority,
    status: "not-started" as GoalStatus,
    startDate: new Date().toISOString().split('T')[0],
    targetDate: "",
    progress: 0,
    alignedWith: "",
    alignmentType: "" as "company-okr" | "team-objective" | "individual-goal" | "",
    createdBy: "Current User",
  });

  const [kpis, setKpis] = useState<Omit<GoalKPI, 'id'>[]>([
    { name: "", target: 0, current: 0, unit: "", description: "" }
  ]);

  const handleAddKPI = () => {
    setKpis([...kpis, { name: "", target: 0, current: 0, unit: "", description: "" }]);
  };

  const handleRemoveKPI = (index: number) => {
    setKpis(kpis.filter((_, i) => i !== index));
  };

  const handleKPIChange = (index: number, field: keyof Omit<GoalKPI, 'id'>, value: any) => {
    const updatedKPIs = [...kpis];
    updatedKPIs[index] = { ...updatedKPIs[index], [field]: value };
    setKpis(updatedKPIs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.targetDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const newGoal: PerformanceGoal = {
        id: `GOAL-${Date.now()}`,
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        startDate: new Date(formData.startDate).toISOString(),
        targetDate: new Date(formData.targetDate).toISOString(),
        progress: formData.progress,
        alignedWith: formData.alignedWith || undefined,
        alignmentType: formData.alignmentType || undefined,
        createdBy: formData.createdBy,
        kpis: kpis.map((kpi, index) => ({
          ...kpi,
          id: `KPI-${Date.now()}-${index}`,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      savePerformanceGoal(newGoal);
      toast.success("Goal created successfully");
      navigate('/performance');
    } catch (error) {
      toast.error("Failed to create goal");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Create Performance Goal</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/performance')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Performance Goal</h1>
              <p className="text-muted-foreground">Set a new goal for an employee</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Goal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Increase customer satisfaction"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Describe the goal and expected outcomes..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., Sales, Customer Service"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: GoalPriority) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      <Label htmlFor="targetDate">Target Date *</Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={formData.targetDate}
                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KPIs */}
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Key Performance Indicators</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddKPI}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add KPI
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {kpis.map((kpi, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="text-base font-semibold flex items-center justify-between">
                        <h4 className="font-semibold">KPI {index + 1}</h4>
                        {kpis.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveKPI(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={kpi.name}
                            onChange={(e) => handleKPIChange(index, 'name', e.target.value)}
                            placeholder="e.g., CSAT Score"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Input
                            value={kpi.unit}
                            onChange={(e) => handleKPIChange(index, 'unit', e.target.value)}
                            placeholder="e.g., %, points, deals"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Target</Label>
                          <Input
                            type="number"
                            value={kpi.target}
                            onChange={(e) => handleKPIChange(index, 'target', Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Current</Label>
                          <Input
                            type="number"
                            value={kpi.current}
                            onChange={(e) => handleKPIChange(index, 'current', Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={kpi.description}
                          onChange={(e) => handleKPIChange(index, 'description', e.target.value)}
                          rows={2}
                          placeholder="How this KPI will be measured..."
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
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
                  <CardTitle className="text-base font-semibold">Alignment (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Alignment Type</Label>
                    <Select
                      value={formData.alignmentType}
                      onValueChange={(value: any) => setFormData({ ...formData, alignmentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company-okr">Company OKR</SelectItem>
                        <SelectItem value="team-objective">Team Objective</SelectItem>
                        <SelectItem value="individual-goal">Individual Goal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.alignmentType && (
                    <div className="space-y-2">
                      <Label>Aligned With</Label>
                      <Input
                        value={formData.alignedWith}
                        onChange={(e) => setFormData({ ...formData, alignedWith: e.target.value })}
                        placeholder="Enter ID or name"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.status}
                    onValueChange={(value: GoalStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Creating..." : "Create Goal"}
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
