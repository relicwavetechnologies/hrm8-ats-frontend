import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Shield, Plus, FileText, AlertCircle, Clock, CheckCircle2, TrendingUp, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useRBAC } from "@/shared/hooks/useRBAC";
import { getERCases, getERCaseStats, deleteERCase, updateERCase } from "@/shared/lib/employeeRelationsStorage";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { ERCase } from "@/shared/types/employeeRelations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ERCaseDialog } from "@/modules/employees/components/employee-relations/ERCaseDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/shared/components/common/DeleteConfirmationDialog";
import { DateRangeFilter, MultiSelectFilter } from "@/shared/components/tables/AdvancedFilters";
import { GroupConfig } from "@/shared/components/tables/TableGrouping";
import { PivotConfig } from "@/shared/components/tables/PivotTable";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

export default function EmployeeRelations() {
  const { isHRAdmin, isSuperAdmin, isManager } = useRBAC();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [caseDialogOpen, setCaseDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<ERCase | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<ERCase | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [enableGrouping, setEnableGrouping] = useState(false);
  const [enablePivot, setEnablePivot] = useState(false);
  const [pivotConfig, setPivotConfig] = useState<PivotConfig | undefined>();

  const cases = getERCases({ status: statusFilter });
  const stats = getERCaseStats();

  const hasAccess = isHRAdmin || isSuperAdmin || isManager;

  const handleDeleteCase = () => {
    if (!caseToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = deleteERCase(caseToDelete.id);
      if (success) {
        toast.success("ER case deleted successfully");
        setDeleteDialogOpen(false);
        setCaseToDelete(null);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Failed to delete case");
      }
    } catch (error) {
      toast.error("Failed to delete case");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    setIsDeleting(true);
    try {
      let successCount = 0;
      selectedCases.forEach((id) => {
        if (deleteERCase(id)) {
          successCount++;
        }
      });
      
      toast.success(`Successfully deleted ${successCount} case${successCount > 1 ? 's' : ''}`);
      setBulkDeleteDialogOpen(false);
      setSelectedCases([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to delete cases");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowUpdate = (id: string, updates: Partial<ERCase>) => {
    const success = updateERCase(id, updates);
    if (success) {
      toast.success("Case updated successfully");
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error("Failed to update case");
    }
  };

  const caseColumns: Column<ERCase>[] = [
    {
      key: "caseNumber",
      label: "Case #",
      sortable: true,
      editable: true,
      editFieldType: "text",
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      editable: true,
      editFieldType: "select",
      editSelectOptions: [
        { value: "complaint", label: "Complaint" },
        { value: "investigation", label: "Investigation" },
        { value: "disciplinary", label: "Disciplinary" },
        { value: "dispute", label: "Dispute" },
        { value: "other", label: "Other" },
      ],
      render: (erCase) => (
        <Badge variant="outline">{erCase.type}</Badge>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      editable: true,
      editFieldType: "select",
      editSelectOptions: [
        { value: "harassment", label: "Harassment" },
        { value: "discrimination", label: "Discrimination" },
        { value: "policy-violation", label: "Policy Violation" },
        { value: "performance", label: "Performance" },
        { value: "misconduct", label: "Misconduct" },
        { value: "workplace-conflict", label: "Workplace Conflict" },
        { value: "other", label: "Other" },
      ],
      render: (erCase) => (
        <Badge variant="secondary">{erCase.category}</Badge>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      editable: true,
      editFieldType: "select",
      editSelectOptions: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" },
      ],
      render: (erCase) => {
        const priority = erCase.priority;
        const colors = {
          low: "text-blue-600",
          medium: "text-yellow-600",
          high: "text-orange-600",
          urgent: "text-red-600",
        };
        return (
          <Badge variant="outline" className={colors[priority]}>
            {priority}
          </Badge>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      editable: true,
      editFieldType: "select",
      editSelectOptions: [
        { value: "open", label: "Open" },
        { value: "investigating", label: "Investigating" },
        { value: "pending-action", label: "Pending Action" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
      ],
      render: (erCase) => {
        const status = erCase.status;
        const colors = {
          open: "bg-blue-50 text-blue-700",
          investigating: "bg-yellow-50 text-yellow-700",
          "pending-action": "bg-orange-50 text-orange-700",
          resolved: "bg-green-50 text-green-700",
          closed: "bg-gray-50 text-gray-700",
        };
        return <Badge className={colors[status]}>{status}</Badge>;
      },
    },
    {
      key: "openedDate",
      label: "Opened",
      sortable: true,
      render: (erCase) => new Date(erCase.openedDate).toLocaleDateString(),
    },
    {
      key: "confidential",
      label: "Confidential",
      render: (erCase) =>
        erCase.confidential ? (
          <Shield className="h-4 w-4 text-red-500" />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (erCase) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background z-50">
            <DropdownMenuItem onClick={() => {
              setEditingCase(erCase);
              setCaseDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Case
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setCaseToDelete(erCase);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Case
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Grouping configuration
  const groupingConfig: GroupConfig = {
    column: "priority",
    label: "Priority Level",
    aggregates: [
      {
        column: "id",
        function: "count",
        label: "Cases",
        format: (value) => value.toString(),
      },
    ],
    renderGroupHeader: (groupValue, count, aggregates) => (
      <div className="flex items-center gap-4">
        <span className={cn(
          "font-semibold capitalize px-2.5 py-0.5 rounded-full text-xs",
          groupValue === "urgent" && "bg-red-100 text-red-800",
          groupValue === "high" && "bg-orange-100 text-orange-800",
          groupValue === "medium" && "bg-yellow-100 text-yellow-800",
          groupValue === "low" && "bg-blue-100 text-blue-800"
        )}>
          {groupValue} Priority
        </span>
        <span className="text-sm text-muted-foreground">
          {count} case{count !== 1 ? 's' : ''}
        </span>
      </div>
    ),
  };

  // Advanced filters configuration
  const dateRangeFilters: DateRangeFilter[] = [
    { key: "opened", label: "Opened Date" },
    { key: "resolved", label: "Resolved Date" },
  ];

  const multiSelectFilters: MultiSelectFilter[] = [
    {
      key: "type",
      label: "Type",
      options: [
        { label: "Complaint", value: "complaint" },
        { label: "Investigation", value: "investigation" },
        { label: "Disciplinary", value: "disciplinary" },
        { label: "Dispute", value: "dispute" },
        { label: "Other", value: "other" },
      ],
      selected: [],
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
        { label: "Urgent", value: "urgent" },
      ],
      selected: [],
    },
  ];

  if (!hasAccess) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Access Restricted</p>
                  <p className="text-sm">You don't have permission to view employee relations cases.</p>
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
              <Shield className="h-8 w-8" />
              Employee Relations
            </h1>
            <p className="text-muted-foreground">
              Manage grievances, investigations, and disciplinary cases
            </p>
          </div>
          <div className="text-base font-semibold flex items-center gap-2">
            <Button
              variant={enableGrouping ? "secondary" : "outline"}
              onClick={() => {
                setEnableGrouping(!enableGrouping);
                if (!enableGrouping) setEnablePivot(false);
              }}
              disabled={enablePivot}
            >
              {enableGrouping ? "Disable" : "Enable"} Grouping
            </Button>
            <Button
              variant={enablePivot ? "secondary" : "outline"}
              onClick={() => {
                setEnablePivot(!enablePivot);
                if (!enablePivot) setEnableGrouping(false);
              }}
              disabled={enableGrouping}
            >
              {enablePivot ? "Disable" : "Enable"} Pivot
            </Button>
            <Button onClick={() => setCaseDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cases</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Cases</p>
                  <p className="text-2xl font-bold">{stats.open}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Investigating</p>
                  <p className="text-2xl font-bold">{stats.investigating}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Resolution</p>
                  <p className="text-2xl font-bold">{stats.avgResolutionTime}d</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases by Type */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(stats.byType).map(([type, count]) => (
            <Card key={type}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground capitalize">{type}</p>
                <p className="text-xl font-bold">{count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setStatusFilter(undefined)}>
              All Cases
            </TabsTrigger>
            <TabsTrigger value="open" onClick={() => setStatusFilter('open')}>
              Open
            </TabsTrigger>
            <TabsTrigger value="investigating" onClick={() => setStatusFilter('investigating')}>
              Investigating
            </TabsTrigger>
            <TabsTrigger value="resolved" onClick={() => setStatusFilter('resolved')}>
              Resolved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">All Cases</CardTitle>
                <CardDescription>
                  {cases.length === 0
                    ? "No cases found. Create your first case to get started."
                    : `Managing ${cases.length} employee relations case${cases.length > 1 ? 's' : ''}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cases.length > 0 ? (
                  <DataTable
                    columns={caseColumns}
                    data={cases}
                    searchKeys={["caseNumber", "type", "category"]}
                    selectable={true}
                    onSelectedRowsChange={setSelectedCases}
                    exportable={true}
                    exportFilename="employee-relations-cases"
                    dateRangeFilters={dateRangeFilters}
                    dateRangeKey="openedDate"
                    multiSelectFilters={multiSelectFilters}
                    enableFilterPresets={true}
                    presetStorageKey="er-cases-filter-presets"
                    columnCustomization={true}
                    columnPreferenceKey="er-cases-columns"
                    inlineEditing={true}
                    onRowUpdate={handleRowUpdate}
                    grouping={enableGrouping ? groupingConfig : undefined}
                    defaultGroupsExpanded={true}
                    pivotMode={enablePivot}
                    pivotConfig={pivotConfig}
                    onPivotConfigChange={setPivotConfig}
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
                    <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Cases Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by creating your first employee relations case
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Case
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Open Cases</CardTitle>
                <CardDescription>Cases requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={caseColumns}
                  data={cases}
                  searchKeys={["caseNumber", "type", "category"]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investigating" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Under Investigation</CardTitle>
                <CardDescription>Active investigations</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={caseColumns}
                  data={cases}
                  searchKeys={["caseNumber", "type", "category"]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Resolved Cases</CardTitle>
                <CardDescription>Completed and closed cases</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={caseColumns}
                  data={cases}
                  searchKeys={["caseNumber", "type", "category"]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ERCaseDialog
          open={caseDialogOpen}
          onOpenChange={(open) => {
            setCaseDialogOpen(open);
            if (!open) setEditingCase(null);
          }}
          editingCase={editingCase}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setEditingCase(null);
          }}
        />
        
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete ER Case"
          description={`Are you sure you want to delete case ${caseToDelete?.caseNumber}? This action cannot be undone.`}
          onConfirm={handleDeleteCase}
          isDeleting={isDeleting}
        />
        
        <DeleteConfirmationDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          title="Delete Multiple Cases"
          description={`Are you sure you want to delete ${selectedCases.length} case${selectedCases.length > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          isDeleting={isDeleting}
        />
      </div>
    </DashboardPageLayout>
  );
}
