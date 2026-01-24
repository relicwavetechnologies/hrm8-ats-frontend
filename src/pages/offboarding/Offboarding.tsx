import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { UserMinus, Plus, Search, Filter, Users, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { getOffboardingWorkflows, calculateOffboardingStats } from "@/shared/lib/offboardingStorage";
import { format, differenceInDays } from "date-fns";
import type { OffboardingStatus, SeparationType } from "@/shared/types/offboarding";

export default function Offboarding() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const workflows = useMemo(() => getOffboardingWorkflows(), []);
  const stats = useMemo(() => calculateOffboardingStats(), []);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch = workflow.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          workflow.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
      const matchesType = typeFilter === "all" || workflow.separationType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [workflows, searchQuery, statusFilter, typeFilter]);

  const getStatusBadge = (status: OffboardingStatus) => {
    const variants: Record<OffboardingStatus, { variant: any; label: string }> = {
      initiated: { variant: 'secondary', label: 'Initiated' },
      'in-progress': { variant: 'default', label: 'In Progress' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    return variants[status];
  };

  const getTypeBadge = (type: SeparationType) => {
    const labels: Record<SeparationType, string> = {
      resignation: 'Resignation',
      termination: 'Termination',
      retirement: 'Retirement',
      'contract-end': 'Contract End',
      mutual: 'Mutual Agreement',
    };
    return labels[type];
  };

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Offboarding Management</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Offboarding</h1>
            <p className="text-muted-foreground">Manage employee exits and transitions</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Offboarding
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Total Offboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOffboarding}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOffboarding}</div>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserMinus className="h-4 w-4 text-muted-foreground" />
                Rehire Eligible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rehireEligibleRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Of departures</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="initiated">Initiated</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="resignation">Resignation</SelectItem>
              <SelectItem value="termination">Termination</SelectItem>
              <SelectItem value="retirement">Retirement</SelectItem>
              <SelectItem value="contract-end">Contract End</SelectItem>
              <SelectItem value="mutual">Mutual Agreement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Workflows List */}
        <div className="space-y-3">
          {filteredWorkflows.map((workflow) => {
            const statusBadge = getStatusBadge(workflow.status);
            const daysRemaining = differenceInDays(new Date(workflow.lastWorkingDay), new Date());
            const completedItems = workflow.clearanceItems.filter(item => item.status === 'approved').length;
            const totalItems = workflow.clearanceItems.length;
            const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

            return (
              <Card 
                key={workflow.id}
                className="cursor-pointer"
                onClick={() => navigate(`/offboarding/${workflow.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold">{workflow.employeeName}</h3>
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      <Badge variant="outline">{getTypeBadge(workflow.separationType)}</Badge>
                      {workflow.rehireEligible && (
                        <Badge variant="secondary">Rehire Eligible</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Department: </span>
                        <span className="font-medium">{workflow.department}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Day: </span>
                        <span className="font-medium">
                          {format(new Date(workflow.lastWorkingDay), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Notice Period: </span>
                        <span className="font-medium">{workflow.noticePeriodDays} days</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Completed'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Clearance Items</span>
                        <span className="font-medium">{completedItems}/{totalItems}</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
