import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Edit2, Save, X, Trash2, Target, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Progress } from "@/shared/components/ui/progress";
import { getPerformanceGoals, savePerformanceGoal, deletePerformanceGoal } from "@/shared/lib/performanceStorage";
import { format } from "date-fns";
import { toast } from "sonner";
import type { PerformanceGoal, GoalStatus, GoalPriority, GoalKPI } from "@/shared/types/performance";

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const goals = useMemo(() => getPerformanceGoals(), []);
  const originalGoal = useMemo(() => goals.find(g => g.id === id), [goals, id]);

  const [editedGoal, setEditedGoal] = useState<PerformanceGoal | null>(originalGoal || null);

  if (!originalGoal || !editedGoal) {
    return (
      <DashboardPageLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Goal Not Found</h3>
              <p className="text-muted-foreground mb-4">The goal you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/performance')}>Back to Performance</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedGoal = {
        ...editedGoal,
        updatedAt: new Date().toISOString(),
      };
      savePerformanceGoal(updatedGoal);
      setIsEditing(false);
      toast.success("Goal updated successfully");
      navigate('/performance');
    } catch (error) {
      toast.error("Failed to update goal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedGoal(originalGoal);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deletePerformanceGoal(editedGoal.id);
      toast.success("Goal deleted successfully");
      navigate('/performance');
    }
  };

  const handleStatusChange = (status: GoalStatus) => {
    const updatedGoal = {
      ...editedGoal,
      status,
      completedDate: status === 'completed' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    setEditedGoal(updatedGoal);
    if (!isEditing) {
      savePerformanceGoal(updatedGoal);
      toast.success("Status updated successfully");
    }
  };

  const handleKPIUpdate = (index: number, field: keyof GoalKPI, value: any) => {
    const updatedKPIs = [...editedGoal.kpis];
    updatedKPIs[index] = { ...updatedKPIs[index], [field]: value };
    setEditedGoal({ ...editedGoal, kpis: updatedKPIs });
  };

  const getStatusBadge = (status: GoalStatus) => {
    const variants: Record<GoalStatus, { variant: any; label: string }> = {
      'not-started': { variant: 'secondary', label: 'Not Started' },
      'in-progress': { variant: 'default', label: 'In Progress' },
      'completed': { variant: 'outline', label: 'Completed' },
      'on-hold': { variant: 'secondary', label: 'On Hold' },
      'cancelled': { variant: 'destructive', label: 'Cancelled' },
    };
    return variants[status];
  };

  const getPriorityBadge = (priority: GoalPriority) => {
    const variants: Record<GoalPriority, { variant: any; label: string }> = {
      'low': { variant: 'secondary', label: 'Low' },
      'medium': { variant: 'default', label: 'Medium' },
      'high': { variant: 'default', label: 'High' },
      'critical': { variant: 'destructive', label: 'Critical' },
    };
    return variants[priority];
  };

  const statusBadge = getStatusBadge(editedGoal.status);
  const priorityBadge = getPriorityBadge(editedGoal.priority);

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>{editedGoal.title} - Goal Detail</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/performance')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Goal Details</h1>
              <p className="text-muted-foreground">View and manage goal progress</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  {isEditing ? (
                    <Input
                      value={editedGoal.title}
                      onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
                    />
                  ) : (
                    <p className="text-lg font-semibold">{editedGoal.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedGoal.description}
                      onChange={(e) => setEditedGoal({ ...editedGoal, description: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-muted-foreground">{editedGoal.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    {isEditing ? (
                      <Input
                        value={editedGoal.category}
                        onChange={(e) => setEditedGoal({ ...editedGoal, category: e.target.value })}
                      />
                    ) : (
                      <p className="text-muted-foreground">{editedGoal.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    {isEditing ? (
                      <Select
                        value={editedGoal.priority}
                        onValueChange={(value: GoalPriority) => setEditedGoal({ ...editedGoal, priority: value })}
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
                    ) : (
                      <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Overall Progress</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Slider
                        value={[editedGoal.progress]}
                        onValueChange={([value]) => setEditedGoal({ ...editedGoal, progress: value })}
                        max={100}
                        step={1}
                      />
                      <p className="text-sm text-muted-foreground text-right">{editedGoal.progress}%</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Progress value={editedGoal.progress} />
                      <p className="text-sm text-muted-foreground text-right">{editedGoal.progress}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* KPIs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editedGoal.kpis.map((kpi, index) => (
                  <div key={kpi.id} className="border rounded-lg p-4 space-y-3">
                    <div className="text-base font-semibold flex items-center justify-between">
                      <h4 className="font-semibold">{kpi.name}</h4>
                      <Badge variant="outline">
                        {kpi.current}/{kpi.target} {kpi.unit}
                      </Badge>
                    </div>
                    {kpi.description && (
                      <p className="text-sm text-muted-foreground">{kpi.description}</p>
                    )}
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Current</Label>
                          <Input
                            type="number"
                            value={kpi.current}
                            onChange={(e) => handleKPIUpdate(index, 'current', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Target</Label>
                          <Input
                            type="number"
                            value={kpi.target}
                            onChange={(e) => handleKPIUpdate(index, 'target', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Progress value={(kpi.current / kpi.target) * 100} />
                        <p className="text-sm text-muted-foreground text-right">
                          {Math.round((kpi.current / kpi.target) * 100)}% complete
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <Select
                    value={editedGoal.status}
                    onValueChange={(value: GoalStatus) => handleStatusChange(value)}
                    disabled={isEditing}
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
                </div>
                <Badge variant={statusBadge.variant} className="w-full justify-center py-2">
                  {statusBadge.label}
                </Badge>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedGoal.startDate.split('T')[0]}
                      onChange={(e) => setEditedGoal({ ...editedGoal, startDate: new Date(e.target.value).toISOString() })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{format(new Date(editedGoal.startDate), 'MMM d, yyyy')}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Target Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedGoal.targetDate.split('T')[0]}
                      onChange={(e) => setEditedGoal({ ...editedGoal, targetDate: new Date(e.target.value).toISOString() })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{format(new Date(editedGoal.targetDate), 'MMM d, yyyy')}</p>
                  )}
                </div>
                {editedGoal.completedDate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Completed Date</Label>
                    <p className="text-sm font-medium">{format(new Date(editedGoal.completedDate), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Additional Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Employee</Label>
                  <p className="font-medium">{editedGoal.employeeName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created By</Label>
                  <p className="font-medium">{editedGoal.createdBy}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created At</Label>
                  <p>{format(new Date(editedGoal.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                  <p>{format(new Date(editedGoal.updatedAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
