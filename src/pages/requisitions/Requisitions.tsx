import { useState, useEffect } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Button } from "@/shared/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { getRequisitions, saveRequisition } from "@/shared/lib/mockRequisitionStorage";
import { JobRequisition } from "@/shared/types/requisition";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { RequisitionForm } from "@/modules/requisitions/components/RequisitionForm";
import { toast } from "@/shared/hooks/use-toast";

export default function Requisitions() {
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = () => {
    setRequisitions(getRequisitions());
  };

  const handleSubmitRequisition = (data: any) => {
    const newRequisition: JobRequisition = {
      id: `req-${Date.now()}`,
      title: data.title,
      department: data.department,
      requestedBy: 'current-user-id',
      requestedByName: 'Current User',
      numberOfPositions: data.numberOfPositions,
      employmentType: data.employmentType,
      location: data.location,
      justification: data.justification,
      budgetCode: data.budgetCode,
      estimatedSalary: {
        min: data.salaryMin,
        max: data.salaryMax,
        currency: data.currency,
      },
      status: 'pending',
      priority: data.priority,
      requestDate: new Date().toISOString(),
      targetStartDate: data.targetStartDate,
      approvalWorkflow: [
        {
          id: 'step-1',
          approverId: 'hr-manager-001',
          approverName: 'HR Manager',
          approverRole: 'HR Manager',
          status: 'pending',
          order: 1,
        },
        {
          id: 'step-2',
          approverId: 'cfo-001',
          approverName: 'CFO',
          approverRole: 'CFO',
          status: 'pending',
          order: 2,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRequisition(newRequisition);
    loadRequisitions();
    setIsFormOpen(false);
    toast({
      title: "Requisition Submitted",
      description: "Your job requisition has been submitted for approval.",
    });
  };

  const getStatusBadge = (status: JobRequisition['status']) => {
    const variants: Record<JobRequisition['status'], { variant: any; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      pending: { variant: "secondary", label: "Pending Approval" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      cancelled: { variant: "outline", label: "Cancelled" },
      converted: { variant: "default", label: "Converted to Job" },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPriorityBadge = (priority: JobRequisition['priority']) => {
    const colors: Record<JobRequisition['priority'], string> = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return <Badge className={colors[priority]} variant="outline">{priority}</Badge>;
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Job Requisitions"
          subtitle="Manage hiring requests and approval workflows"
        >
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Requisition
          </Button>
        </AtsPageHeader>

        <div className="grid gap-4">
          {requisitions.map((req) => (
            <Card key={req.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">{req.title}</CardTitle>
                    <CardDescription>
                      {req.department} • {req.numberOfPositions} position(s) • {req.location}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(req.status)}
                    {getPriorityBadge(req.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Requested by: {req.requestedByName}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(req.requestDate), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">Budget: </span>
                      <span>
                        ${req.estimatedSalary.min.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} - $
                        {req.estimatedSalary.max.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {req.estimatedSalary.currency}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/requisitions/${req.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {requisitions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Requisitions</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first job requisition to start the approval process
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Requisition
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Job Requisition</DialogTitle>
            </DialogHeader>
            <RequisitionForm 
              onSubmit={handleSubmitRequisition}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageLayout>
  );
}