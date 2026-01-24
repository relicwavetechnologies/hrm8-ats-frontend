import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import type { Feedback360 } from "@/shared/types/performance";
import { format } from "date-fns";
import { Users, CheckCircle, Clock } from "lucide-react";

interface Feedback360CardProps {
  feedback: Feedback360;
}

export function Feedback360Card({ feedback }: Feedback360CardProps) {
  const submittedCount = feedback.providers.filter(p => p.status === 'submitted').length;
  const totalCount = feedback.providers.length;
  const completionPercentage = (submittedCount / totalCount) * 100;

  const getStatusBadge = () => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      'pending': { label: 'Pending', variant: 'secondary' },
      'in-progress': { label: 'In Progress', variant: 'default' },
      'completed': { label: 'Completed', variant: 'default' },
    };
    const { label, variant } = variants[feedback.status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">360° Feedback - {feedback.reviewCycle}</CardTitle>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              Requested by {feedback.requestedByName}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              Feedback Progress
            </span>
            <span className="font-semibold">{submittedCount} / {totalCount} submitted</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          {feedback.providers.map((provider) => (
            <div key={provider.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="font-medium">{provider.providerName}</span>
                <Badge variant="outline" className="text-xs">
                  {provider.relationship}
                </Badge>
              </div>
              {provider.status === 'submitted' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="pt-3 border-t text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Due Date</span>
            <span className="font-medium">{format(new Date(feedback.dueDate), "MMM d, yyyy")}</span>
          </div>
        </div>

        {feedback.completedAt && (
          <div className="text-sm">
            <p className="text-muted-foreground">Completed</p>
            <p className="font-medium">{format(new Date(feedback.completedAt), "MMM d, yyyy")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
