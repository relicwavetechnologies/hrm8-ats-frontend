import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Users, Plus, TrendingUp, DollarSign, Building2, MapPin, BarChart3, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useRBAC } from "@/shared/hooks/useRBAC";
import { getHeadcountPlans, getWorkforceDemographics, deleteHeadcountPlan } from "@/shared/lib/workforcePlanningStorage";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { HeadcountPlan } from "@/shared/types/workforcePlanning";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { HeadcountPlanDialog } from "@/shared/components/workforce/HeadcountPlanDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/shared/components/shared/DeleteConfirmationDialog";
import { toast } from "sonner";

export default function WorkforcePlanning() {
  const { isHRAdmin, isSuperAdmin, isManager } = useRBAC();
  const [activeTab, setActiveTab] = useState("headcount");
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<HeadcountPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<HeadcountPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const plans = getHeadcountPlans();
  const demographics = getWorkforceDemographics();

  const hasAccess = isHRAdmin || isSuperAdmin || isManager;

  const handleDeletePlan = () => {
    if (!planToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = deleteHeadcountPlan(planToDelete.id);
      if (success) {
        toast.success("Headcount plan deleted successfully");
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Failed to delete plan");
      }
    } catch (error) {
      toast.error("Failed to delete plan");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    setIsDeleting(true);
    try {
      let successCount = 0;
      selectedPlans.forEach((id) => {
        if (deleteHeadcountPlan(id)) {
          successCount++;
        }
      });
      
      toast.success(`Successfully deleted ${successCount} plan${successCount > 1 ? 's' : ''}`);
      setBulkDeleteDialogOpen(false);
      setSelectedPlans([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to delete plans");
    } finally {
      setIsDeleting(false);
    }
  };

  const planColumns: Column<HeadcountPlan>[] = [
    {
      key: "fiscalYear",
      label: "Fiscal Year",
      sortable: true,
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
    },
    {
      key: "currentHeadcount",
      label: "Current",
      sortable: true,
    },
    {
      key: "plannedHeadcount",
      label: "Planned",
      sortable: true,
    },
    {
      key: "approvedHeadcount",
      label: "Approved",
      sortable: true,
      render: (plan) => plan.approvedHeadcount || "-",
    },
    {
      key: "budgetAllocated",
      label: "Budget",
      sortable: true,
      render: (plan) => `$${(plan.budgetAllocated / 1000000).toFixed(1)}M`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (plan) => {
        const colors = {
          draft: "bg-gray-50 text-gray-700",
          submitted: "bg-blue-50 text-blue-700",
          approved: "bg-green-50 text-green-700",
          rejected: "bg-red-50 text-red-700",
        };
        return <Badge className={colors[plan.status]}>{plan.status}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (plan) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => {
              setEditingPlan(plan);
              setPlanDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Plan
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setPlanToDelete(plan);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (!hasAccess) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Access Restricted</p>
                  <p className="text-sm">You don't have permission to view workforce planning.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Workforce Planning
            </h1>
            <p className="text-muted-foreground">
              Strategic headcount planning and budget forecasting
            </p>
          </div>
          <Button onClick={() => setPlanDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>

        {/* Demographics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{demographics.totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Tenure</p>
                  <p className="text-2xl font-bold">{demographics.avgTenure} yrs</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attrition Rate</p>
                  <p className="text-2xl font-bold">{demographics.attritionRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cost per Hire</p>
                  <p className="text-2xl font-bold">${demographics.costPerHire.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="headcount">Headcount Plans</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="forecasts">Budget Forecasts</TabsTrigger>
          </TabsList>

          <TabsContent value="headcount" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Headcount Planning</CardTitle>
                <CardDescription>
                  Manage departmental headcount and position requisitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plans.length > 0 ? (
                  <DataTable
                    columns={planColumns}
                    data={plans}
                    searchKeys={["department", "fiscalYear"]}
                    selectable={true}
                    onSelectedRowsChange={setSelectedPlans}
                    exportable={true}
                    exportFilename="headcount-plans"
                    renderBulkActions={(selectedIds) => (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    )}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Plans Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first headcount plan to start strategic workforce planning
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    By Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(demographics.byDepartment).map(([dept, count]) => (
                      <div key={dept} className="text-base font-semibold flex items-center justify-between">
                        <span className="text-sm">{dept}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    By Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(demographics.byLocation).map(([location, count]) => (
                      <div key={location} className="text-base font-semibold flex items-center justify-between">
                        <span className="text-sm">{location}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    By Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(demographics.byLevel).map(([level, count]) => (
                      <div key={level} className="text-base font-semibold flex items-center justify-between">
                        <span className="text-sm">{level}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-base font-semibold flex items-center justify-between">
                      <span className="text-sm">Time to Fill</span>
                      <Badge variant="outline">{demographics.timeToFill} days</Badge>
                    </div>
                    <div className="text-base font-semibold flex items-center justify-between">
                      <span className="text-sm">Cost per Hire</span>
                      <Badge variant="outline">${demographics.costPerHire.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Badge>
                    </div>
                    <div className="text-base font-semibold flex items-center justify-between">
                      <span className="text-sm">Attrition Rate</span>
                      <Badge variant="outline">{demographics.attritionRate}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Scenario Modeling</CardTitle>
                <CardDescription>
                  Create what-if scenarios for workforce projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Build scenarios to model different workforce growth strategies and their impact.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Budget Forecasts</CardTitle>
                <CardDescription>
                  Financial projections for workforce expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  View and manage budget forecasts for salaries, benefits, and overhead costs.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <HeadcountPlanDialog
          open={planDialogOpen}
          onOpenChange={(open) => {
            setPlanDialogOpen(open);
            if (!open) setEditingPlan(null);
          }}
          editingPlan={editingPlan}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setEditingPlan(null);
          }}
        />
        
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Headcount Plan"
          description={`Are you sure you want to delete the plan for ${planToDelete?.department} - FY${planToDelete?.fiscalYear}? This action cannot be undone.`}
          onConfirm={handleDeletePlan}
          isDeleting={isDeleting}
        />
        
        <DeleteConfirmationDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          title="Delete Multiple Plans"
          description={`Are you sure you want to delete ${selectedPlans.length} plan${selectedPlans.length > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          isDeleting={isDeleting}
        />
      </div>
    </DashboardPageLayout>
  );
}
