import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import type { LeaveBalance } from "@/shared/types/leave";

interface LeaveBalanceOverviewProps {
  balances: LeaveBalance[];
  year: number;
}

export function LeaveBalanceOverview({ balances, year }: LeaveBalanceOverviewProps) {
  const totalAllocated = balances.reduce((sum, b) => sum + b.allocated, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0);
  const totalPending = balances.reduce((sum, b) => sum + b.pending, 0);
  const totalAvailable = balances.reduce((sum, b) => sum + b.available, 0);
  const totalCarriedOver = balances.reduce((sum, b) => sum + b.carriedOver, 0);

  const usagePercentage = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;
  const pendingPercentage = totalAllocated > 0 ? (totalPending / totalAllocated) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAllocated} days</div>
          <p className="text-xs text-muted-foreground">For {year}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Used</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsed} days</div>
          <Progress value={usagePercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {usagePercentage.toFixed(1)}% of allocated
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <Calendar className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPending} days</div>
          <Progress value={pendingPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Awaiting approval
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAvailable} days</div>
          {totalCarriedOver > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{totalCarriedOver} carried over
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
