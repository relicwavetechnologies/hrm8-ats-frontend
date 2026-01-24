import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Edit2, Save, X, Trash2, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { getPerformanceReviews, savePerformanceReview, getReviewTemplates } from "@/shared/lib/performanceStorage";
import { format } from "date-fns";
import { toast } from "sonner";
import type { PerformanceReview, ReviewStatus, ReviewResponse } from "@/shared/types/performance";

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const reviews = useMemo(() => getPerformanceReviews(), []);
  const templates = useMemo(() => getReviewTemplates(), []);
  const originalReview = useMemo(() => reviews.find(r => r.id === id), [reviews, id]);

  const [editedReview, setEditedReview] = useState<PerformanceReview | null>(originalReview || null);

  const template = useMemo(() => {
    if (!editedReview) return null;
    return templates.find(t => t.id === editedReview.templateId);
  }, [templates, editedReview]);

  if (!originalReview || !editedReview || !template) {
    return (
      <DashboardPageLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Review Not Found</h3>
              <p className="text-muted-foreground mb-4">The review you're looking for doesn't exist.</p>
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
      const updatedReview = {
        ...editedReview,
        updatedAt: new Date().toISOString(),
      };
      savePerformanceReview(updatedReview);
      setIsEditing(false);
      toast.success("Review updated successfully");
      navigate('/performance');
    } catch (error) {
      toast.error("Failed to update review");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedReview(originalReview);
    setIsEditing(false);
  };

  const handleStatusChange = (status: ReviewStatus) => {
    const updatedReview = {
      ...editedReview,
      status,
      completedDate: status === 'completed' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    setEditedReview(updatedReview);
    if (!isEditing) {
      savePerformanceReview(updatedReview);
      toast.success("Status updated successfully");
    }
  };

  const handleResponseUpdate = (sectionId: string, questionId: string, field: keyof ReviewResponse, value: any) => {
    const responses = [...editedReview.responses];
    const existingIndex = responses.findIndex(r => r.sectionId === sectionId && r.questionId === questionId);
    
    if (existingIndex >= 0) {
      responses[existingIndex] = { ...responses[existingIndex], [field]: value };
    } else {
      responses.push({ sectionId, questionId, [field]: value } as ReviewResponse);
    }
    
    setEditedReview({ ...editedReview, responses });
  };

  const getResponse = (sectionId: string, questionId: string) => {
    return editedReview.responses.find(r => r.sectionId === sectionId && r.questionId === questionId);
  };

  const handleApprovalAction = (stageIndex: number, action: 'approved' | 'rejected', comments: string) => {
    if (!editedReview.approvalWorkflow) return;

    const workflow = { ...editedReview.approvalWorkflow };
    workflow.stages[stageIndex] = {
      ...workflow.stages[stageIndex],
      status: action,
      comments,
      actionDate: new Date().toISOString(),
    };

    if (action === 'rejected') {
      workflow.overallStatus = 'rejected';
    } else if (stageIndex === workflow.stages.length - 1) {
      workflow.overallStatus = 'approved';
    } else {
      workflow.currentStageIndex = stageIndex + 1;
      workflow.overallStatus = 'in-progress';
    }

    const updatedReview = {
      ...editedReview,
      approvalWorkflow: workflow,
      updatedAt: new Date().toISOString(),
    };

    setEditedReview(updatedReview);
    savePerformanceReview(updatedReview);
    toast.success(`Review ${action}`);
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const variants: Record<ReviewStatus, { variant: any; label: string; icon: any }> = {
      'not-started': { variant: 'secondary', label: 'Not Started', icon: Clock },
      'in-progress': { variant: 'default', label: 'In Progress', icon: Clock },
      'completed': { variant: 'outline', label: 'Completed', icon: CheckCircle },
      'overdue': { variant: 'destructive', label: 'Overdue', icon: XCircle },
    };
    return variants[status];
  };

  const statusBadge = getStatusBadge(editedReview.status);
  const StatusIcon = statusBadge.icon;

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>{editedReview.employeeName} - Review Detail</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/performance')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Performance Review</h1>
              <p className="text-muted-foreground">{editedReview.employeeName}</p>
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
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Sections */}
            {template.sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
                  {section.description && (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.questions.map((question) => {
                    const response = getResponse(section.id, question.id);
                    return (
                      <div key={question.id} className="space-y-3 pb-6 border-b last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Label className="text-base">{question.question}</Label>
                            {question.helpText && (
                              <p className="text-xs text-muted-foreground mt-1">{question.helpText}</p>
                            )}
                          </div>
                          {question.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>

                        {question.type === 'rating' && (
                          <div className="space-y-2">
                            {isEditing ? (
                              <>
                                <Slider
                                  value={[response?.rating || 3]}
                                  onValueChange={([value]) => handleResponseUpdate(section.id, question.id, 'rating', value)}
                                  min={1}
                                  max={5}
                                  step={1}
                                />
                                <p className="text-sm text-muted-foreground text-right">
                                  {response?.rating || 3}/5
                                </p>
                              </>
                            ) : (
                              <div className="text-base font-semibold flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div
                                    key={star}
                                    className={`h-8 w-8 rounded-full border-2 ${
                                      star <= (response?.rating || 0)
                                        ? 'bg-primary border-primary'
                                        : 'border-muted'
                                    }`}
                                  />
                                ))}
                                <span className="text-sm font-medium ml-2">{response?.rating || 0}/5</span>
                              </div>
                            )}
                          </div>
                        )}

                        {question.type === 'text' && (
                          <Textarea
                            value={response?.textResponse || ''}
                            onChange={(e) => handleResponseUpdate(section.id, question.id, 'textResponse', e.target.value)}
                            disabled={!isEditing}
                            rows={4}
                            placeholder={isEditing ? "Enter your response..." : "No response provided"}
                          />
                        )}

                        {question.type === 'yes-no' && (
                          <Select
                            value={response?.textResponse || ''}
                            onValueChange={(value) => handleResponseUpdate(section.id, question.id, 'textResponse', value)}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an answer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {/* Overall Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Overall Rating</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Slider
                        value={[editedReview.overallRating || 3]}
                        onValueChange={([value]) => setEditedReview({ ...editedReview, overallRating: value })}
                        min={1}
                        max={5}
                        step={0.5}
                      />
                      <p className="text-sm text-muted-foreground text-right">
                        {editedReview.overallRating || 3}/5
                      </p>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">{editedReview.overallRating || 0}/5</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Strengths</Label>
                  <Textarea
                    value={editedReview.strengths || ''}
                    onChange={(e) => setEditedReview({ ...editedReview, strengths: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder={isEditing ? "Key strengths..." : "No strengths listed"}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Areas for Improvement</Label>
                  <Textarea
                    value={editedReview.areasForImprovement || ''}
                    onChange={(e) => setEditedReview({ ...editedReview, areasForImprovement: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder={isEditing ? "Areas to focus on..." : "No areas listed"}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Goals for Next Period</Label>
                  <Textarea
                    value={editedReview.goals || ''}
                    onChange={(e) => setEditedReview({ ...editedReview, goals: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder={isEditing ? "Goals..." : "No goals set"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={editedReview.status}
                  onValueChange={(value: ReviewStatus) => handleStatusChange(value)}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={statusBadge.variant} className="w-full justify-center py-2">
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusBadge.label}
                </Badge>
              </CardContent>
            </Card>

            {/* Review Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Review Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Employee</Label>
                  <p className="font-medium">{editedReview.employeeName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Reviewer</Label>
                  <p className="font-medium">{editedReview.reviewerName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Template</Label>
                  <p className="font-medium">{editedReview.templateName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Review Period</Label>
                  <p>
                    {format(new Date(editedReview.reviewPeriodStart), 'MMM d, yyyy')} -{' '}
                    {format(new Date(editedReview.reviewPeriodEnd), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <p>{format(new Date(editedReview.dueDate), 'MMM d, yyyy')}</p>
                </div>
                {editedReview.completedDate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Completed Date</Label>
                    <p>{format(new Date(editedReview.completedDate), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Workflow */}
            {editedReview.approvalWorkflow && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Approval Workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge
                    variant={
                      editedReview.approvalWorkflow.overallStatus === 'approved'
                        ? 'outline'
                        : editedReview.approvalWorkflow.overallStatus === 'rejected'
                        ? 'destructive'
                        : 'default'
                    }
                    className="w-full justify-center py-2"
                  >
                    {editedReview.approvalWorkflow.overallStatus.toUpperCase()}
                  </Badge>
                  <div className="space-y-3">
                    {editedReview.approvalWorkflow.stages.map((stage, index) => (
                      <div key={stage.id} className="border rounded-lg p-3 space-y-2">
                        <div className="text-base font-semibold flex items-center justify-between">
                          <p className="font-medium text-sm">{stage.name}</p>
                          <Badge
                            variant={
                              stage.status === 'approved'
                                ? 'outline'
                                : stage.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {stage.status}
                          </Badge>
                        </div>
                        {stage.approverName && (
                          <p className="text-xs text-muted-foreground">{stage.approverName}</p>
                        )}
                        {stage.comments && (
                          <p className="text-xs bg-muted p-2 rounded">{stage.comments}</p>
                        )}
                        {stage.status === 'pending' && index === editedReview.approvalWorkflow.currentStageIndex && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleApprovalAction(index, 'approved', 'Approved')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleApprovalAction(index, 'rejected', 'Rejected')}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
