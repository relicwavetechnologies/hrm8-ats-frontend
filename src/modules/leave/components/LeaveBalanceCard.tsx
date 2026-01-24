import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import type { LeaveBalance } from "@/shared/types/leave";

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const usedPercentage = (balance.used / balance.allocated) * 100;
  const pendingPercentage = (balance.pending / balance.allocated) * 100;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{balance.leaveTypeName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available</span>
            <span className="font-semibold">{balance.available} days</span>
          </div>
          <Progress value={usedPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-muted-foreground">Allocated</p>
            <p className="font-semibold">{balance.allocated}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Used</p>
            <p className="font-semibold">{balance.used}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pending</p>
            <p className="font-semibold">{balance.pending}</p>
          </div>
        </div>
        
        {balance.carriedOver > 0 && (
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Carried Over</span>
              <span className="font-medium">{balance.carriedOver} days</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
