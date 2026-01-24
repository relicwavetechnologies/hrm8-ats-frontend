import { Card, CardContent } from "@/shared/components/ui/card";
import { getEmploymentHistory } from "@/shared/lib/employeeStorage";
import { format } from "date-fns";
import { Badge } from "@/shared/components/ui/badge";
import { Briefcase } from "lucide-react";

interface EmployeeHistoryTabProps {
  employeeId: string;
}

export function EmployeeHistoryTab({ employeeId }: EmployeeHistoryTabProps) {
  const history = getEmploymentHistory(employeeId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Employment History</h3>
        <p className="text-sm text-muted-foreground">
          View position changes and salary history
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {history.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{item.position}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.department} • {item.location}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        ${item.salary.toLocaleString()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>
                        {format(new Date(item.startDate), "MMM d, yyyy")}
                        {item.endDate ? ` - ${format(new Date(item.endDate), "MMM d, yyyy")}` : ' - Present'}
                      </span>
                    </div>
                    
                    {item.changeReason && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Reason: </span>
                          {item.changeReason}
                        </p>
                      </div>
                    )}
                    
                    {item.notes && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm">{item.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {history.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Employment History</h3>
                <p className="text-sm text-muted-foreground">
                  Position changes and salary history will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
