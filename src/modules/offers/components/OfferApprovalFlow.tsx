import { ApprovalStep } from "@/shared/types/requisition";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OfferApprovalFlowProps {
  approvalWorkflow: ApprovalStep[];
}

export function OfferApprovalFlow({ approvalWorkflow }: OfferApprovalFlowProps) {
  if (!approvalWorkflow || approvalWorkflow.length === 0) {
    return null;
  }

  const getStatusIcon = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'approved':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvalWorkflow.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${getStatusColor(step.status)}`}>
                  {getStatusIcon(step.status)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{step.approverName}</p>
                      <p className="text-sm text-muted-foreground">{step.approverRole}</p>
                    </div>
                    <Badge variant={
                      step.status === 'approved' ? 'default' :
                      step.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {step.status}
                    </Badge>
                  </div>

                  {step.comments && (
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <p className="font-medium mb-1">Comments:</p>
                      <p>{step.comments}</p>
                    </div>
                  )}

                  {step.approvedAt && (
                    <p className="text-xs text-muted-foreground">
                      {step.status === 'approved' ? 'Approved' : 'Rejected'}{' '}
                      {formatDistanceToNow(new Date(step.approvedAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>

              {index < approvalWorkflow.length - 1 && (
                <div className="absolute left-[19px] top-10 w-0.5 h-16 bg-border" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
