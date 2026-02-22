import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Check, X, MessageSquare } from "lucide-react";
import { getRequisitionById, updateRequisition } from "@/shared/lib/mockRequisitionStorage";
import { JobRequisition } from "@/shared/types/requisition";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "@/shared/hooks/use-toast";

export default function RequisitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState<JobRequisition | null>(null);
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (id) {
      const req = getRequisitionById(id);
      setRequisition(req || null);
    }
  }, [id]);

  if (!requisition) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <p>Requisition not found</p>
        </div>
      </DashboardPageLayout>
    );
  }

  const handleApprove = () => {
    updateRequisition(requisition.id, {
      status: 'approved',
      approvalWorkflow: requisition.approvalWorkflow.map(step => 
        step.status === 'pending' ? { ...step, status: 'approved', comments, approvedAt: new Date().toISOString() } : step
      ),
    });
    toast({
      title: "Requisition Approved",
      description: "The job requisition has been approved.",
    });
    navigate("/requisitions");
  };

  const handleReject = () => {
    updateRequisition(requisition.id, {
      status: 'rejected',
      rejectionReason: comments,
    });
    toast({
      title: "Requisition Rejected",
      description: "The job requisition has been rejected.",
      variant: "destructive",
    });
    navigate("/requisitions");
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title={requisition.title}
          subtitle={requisition.department}
        >
          <div className="text-base font-semibold flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/requisitions")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
          </Button>
            <Badge variant="outline" className="h-6 px-2 text-xs">{requisition.status}</Badge>
          </div>
        </AtsPageHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Requisition Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Number of Positions:</span>
                <p>{requisition.numberOfPositions}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Employment Type:</span>
                <p className="capitalize">{requisition.employmentType}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Location:</span>
                <p>{requisition.location}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Estimated Salary:</span>
                <p>
                  ${requisition.estimatedSalary.min.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} - $
                  {requisition.estimatedSalary.max.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {requisition.estimatedSalary.currency}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Budget Code:</span>
                <p>{requisition.budgetCode || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Business Justification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{requisition.justification}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Approval Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requisition.approvalWorkflow.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    step.status === 'approved' ? 'bg-green-100 text-green-600' :
                    step.status === 'rejected' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {step.status === 'approved' ? <Check className="h-5 w-5" /> :
                     step.status === 'rejected' ? <X className="h-5 w-5" /> :
                     index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold flex items-center justify-between">
                      <div>
                        <p className="font-medium">{step.approverName}</p>
                        <p className="text-sm text-muted-foreground">{step.approverRole}</p>
                      </div>
                      <Badge variant={
                        step.status === 'approved' ? 'default' :
                        step.status === 'rejected' ? 'destructive' :
                        'outline'
                      }>
                        {step.status}
                      </Badge>
                    </div>
                    {step.comments && (
                      <div className="mt-2 text-sm bg-muted p-2 rounded">
                        <MessageSquare className="h-3 w-3 inline mr-1" />
                        {step.comments}
                      </div>
                    )}
                    {step.approvedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(step.approvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {requisition.status === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Review & Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Comments</Label>
                <Textarea
                  placeholder="Add your comments or feedback..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleApprove} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button onClick={handleReject} variant="destructive" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardPageLayout>
  );
}