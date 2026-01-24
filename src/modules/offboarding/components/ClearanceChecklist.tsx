import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { getOffboardingWorkflows, updateOffboardingWorkflow } from "@/shared/lib/offboardingStorage";
import type { ClearanceStatus, ClearanceItem } from "@/shared/types/offboarding";

interface ClearanceChecklistProps {
  workflowId: string;
  onUpdate?: () => void;
}

export function ClearanceChecklist({ workflowId, onUpdate }: ClearanceChecklistProps) {
  const { toast } = useToast();
  const workflows = getOffboardingWorkflows();
  const workflow = workflows.find(w => w.id === workflowId);

  if (!workflow) return null;

  const handleStatusChange = (itemId: string, newStatus: ClearanceStatus) => {
    const updatedItems = workflow.clearanceItems.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            status: newStatus,
            completedAt: newStatus === 'approved' ? new Date().toISOString() : undefined 
          }
        : item
    );

    updateOffboardingWorkflow(workflowId, { clearanceItems: updatedItems });
    
    toast({
      title: "Status Updated",
      description: `Clearance item marked as ${newStatus}`,
    });

    onUpdate?.();
  };

  const getStatusIcon = (status: ClearanceStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ClearanceStatus) => {
    const variants: Record<ClearanceStatus, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'outline', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    };
    return variants[status];
  };

  const categories = Array.from(new Set(workflow.clearanceItems.map(item => item.category)));

  return (
    <div className="space-y-6">
      {categories.map(category => {
        const items = workflow.clearanceItems.filter(item => item.category === category);
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base capitalize">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => {
                const statusBadge = getStatusBadge(item.status);
                
                return (
                  <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {getStatusIcon(item.status)}
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-medium">{item.item}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Responsible: </span>
                        {item.responsiblePerson}
                      </div>

                      {item.notes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notes: </span>
                          <span>{item.notes}</span>
                        </div>
                      )}

                      {item.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(item.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(item.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
