import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Shield, FileText, AlertTriangle, CheckCircle, History, Database, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useRBAC } from "@/shared/hooks/useRBAC";
import { getAuditLogs, getPolicies, getPolicyAcknowledgments, getComplianceAlerts, getDataSubjectRequests, deletePolicy, deleteDataSubjectRequest } from "@/shared/lib/complianceStorage";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { AuditLog, CompliancePolicy, ComplianceAlert, DataSubjectRequest } from "@/shared/types/compliance";
import { PolicyDialog } from "@/modules/compliance/components/PolicyDialog";
import { DataSubjectRequestDialog } from "@/modules/compliance/components/DataSubjectRequestDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/shared/components/ui/delete-confirmation-dialog";
import { toast } from "sonner";

export default function Compliance() {
  const { isHRAdmin, isSuperAdmin } = useRBAC();
  const [activeTab, setActiveTab] = useState("overview");
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [dsrDialogOpen, setDsrDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CompliancePolicy | null>(null);
  const [editingDSR, setEditingDSR] = useState<DataSubjectRequest | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"policy" | "dsr" | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteType, setBulkDeleteType] = useState<"policy" | "dsr" | null>(null);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [selectedDSRs, setSelectedDSRs] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const auditLogs = getAuditLogs();
  const policies = getPolicies();
  const alerts = getComplianceAlerts();
  const dsRequests = getDataSubjectRequests();

  const auditColumns: Column<AuditLog>[] = [
    {
      key: "timestamp",
      label: "Timestamp",
      sortable: true,
      render: (log) => new Date(log.timestamp).toLocaleString(),
    },
    {
      key: "userName",
      label: "User",
      sortable: true,
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
      render: (log) => (
        <Badge variant="outline">{log.action}</Badge>
      ),
    },
    {
      key: "module",
      label: "Module",
      sortable: true,
    },
    {
      key: "ipAddress",
      label: "IP Address",
    },
  ];

  const policyColumns: Column<CompliancePolicy>[] = [
    {
      key: "title",
      label: "Policy Title",
      sortable: true,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (policy) => (
        <Badge variant="secondary">{policy.category}</Badge>
      ),
    },
    {
      key: "version",
      label: "Version",
      sortable: true,
    },
    {
      key: "effectiveDate",
      label: "Effective Date",
      sortable: true,
    },
    {
      key: "requiresAcknowledgment",
      label: "Requires Ack.",
      render: (policy) => (
        policy.requiresAcknowledgment ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (policy) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => {
              setEditingPolicy(policy);
              setPolicyDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Policy
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setDeleteType("policy");
                setItemToDelete(policy);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Policy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const dsrColumns: Column<DataSubjectRequest>[] = [
    {
      key: "type",
      label: "Request Type",
      sortable: true,
      render: (dsr) => <Badge variant="outline">{dsr.type}</Badge>,
    },
    {
      key: "requestDate",
      label: "Requested",
      sortable: true,
      render: (dsr) => new Date(dsr.requestDate).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (dsr) => {
        const colors = {
          pending: "bg-yellow-50 text-yellow-700",
          "in-progress": "bg-blue-50 text-blue-700",
          completed: "bg-green-50 text-green-700",
          rejected: "bg-red-50 text-red-700",
        };
        return <Badge className={colors[dsr.status]}>{dsr.status}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (dsr) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => {
              setEditingDSR(dsr);
              setDsrDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Request
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setDeleteType("dsr");
                setItemToDelete(dsr);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleDelete = () => {
    if (!itemToDelete || !deleteType) return;

    setIsDeleting(true);
    try {
      let success = false;
      let message = "";

      if (deleteType === "policy") {
        success = deletePolicy(itemToDelete.id);
        message = "Policy deleted successfully";
      } else if (deleteType === "dsr") {
        success = deleteDataSubjectRequest(itemToDelete.id);
        message = "Data subject request deleted successfully";
      }

      if (success) {
        toast.success(message);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        setDeleteType(null);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    if (!bulkDeleteType) return;

    setIsDeleting(true);
    try {
      let successCount = 0;
      let selectedIds: string[] = [];

      if (bulkDeleteType === "policy") {
        selectedIds = selectedPolicies;
        selectedIds.forEach((id) => {
          if (deletePolicy(id)) successCount++;
        });
      } else if (bulkDeleteType === "dsr") {
        selectedIds = selectedDSRs;
        selectedIds.forEach((id) => {
          if (deleteDataSubjectRequest(id)) successCount++;
        });
      }

      toast.success(`Successfully deleted ${successCount} item${successCount > 1 ? 's' : ''}`);
      setBulkDeleteDialogOpen(false);
      setSelectedPolicies([]);
      setSelectedDSRs([]);
      setBulkDeleteType(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to delete items");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isHRAdmin && !isSuperAdmin) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Access Restricted</p>
                  <p className="text-sm">You don't have permission to view compliance data.</p>
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
              Compliance & Audit
            </h1>
            <p className="text-muted-foreground">
              Manage policies, audit trails, and compliance reporting
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                    {alerts.length} Compliance Alert{alerts.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-2 mt-2">
                    {alerts.slice(0, 3).map((alert) => (
                      <p key={alert.id} className="text-sm text-orange-800 dark:text-orange-200">
                        • {alert.message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Policies</p>
                  <p className="text-2xl font-bold">{policies.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Audit Logs</p>
                  <p className="text-2xl font-bold">{auditLogs.length}</p>
                </div>
                <History className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold">{alerts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Data Requests</p>
                  <p className="text-2xl font-bold">{dsRequests.length}</p>
                </div>
                <Database className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="acknowledgments">Acknowledgments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Compliance Overview</CardTitle>
                <CardDescription>Key compliance metrics and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Policy Acknowledgment Rate</p>
                        <p className="text-sm text-muted-foreground">95% of employees</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <History className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Audit Log Retention</p>
                        <p className="text-sm text-muted-foreground">7 years of records</p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">GDPR Compliance</p>
                        <p className="text-sm text-muted-foreground">Data subject requests tracked</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50">Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit-logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Audit Trail</CardTitle>
                <CardDescription>Complete system activity log</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={auditColumns}
                  data={auditLogs.slice(0, 50)}
                  searchKeys={["userName", "module", "action"]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="text-base font-semibold flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Company Policies</CardTitle>
                    <CardDescription>Manage organizational policies</CardDescription>
                  </div>
                  <Button onClick={() => setPolicyDialogOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Add Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={policyColumns}
                  data={policies}
                  searchKeys={["title", "category"]}
                  selectable={true}
                  onSelectedRowsChange={setSelectedPolicies}
                  exportable={true}
                  exportFilename="compliance-policies"
                  renderBulkActions={(selectedIds) => (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setBulkDeleteType("policy");
                        setBulkDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acknowledgments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Policy Acknowledgments</CardTitle>
                <CardDescription>Track employee policy acknowledgments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acknowledgment tracking will display employee signatures and dates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Compliance Reports</CardTitle>
                <CardDescription>Generate and view compliance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto flex-col items-start p-4">
                    <FileText className="h-5 w-5 mb-2" />
                    <p className="font-semibold">GDPR Report</p>
                    <p className="text-sm text-muted-foreground">Data processing activities</p>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-start p-4">
                    <FileText className="h-5 w-5 mb-2" />
                    <p className="font-semibold">Audit Summary</p>
                    <p className="text-sm text-muted-foreground">Monthly audit overview</p>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-start p-4">
                    <FileText className="h-5 w-5 mb-2" />
                    <p className="font-semibold">Policy Compliance</p>
                    <p className="text-sm text-muted-foreground">Acknowledgment status</p>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-start p-4">
                    <FileText className="h-5 w-5 mb-2" />
                    <p className="font-semibold">Data Retention</p>
                    <p className="text-sm text-muted-foreground">Record lifecycle report</p>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <PolicyDialog
          open={policyDialogOpen}
          onOpenChange={(open) => {
            setPolicyDialogOpen(open);
            if (!open) setEditingPolicy(null);
          }}
          editingPolicy={editingPolicy}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setEditingPolicy(null);
          }}
        />
        <DataSubjectRequestDialog
          open={dsrDialogOpen}
          onOpenChange={(open) => {
            setDsrDialogOpen(open);
            if (!open) setEditingDSR(null);
          }}
          editingRequest={editingDSR}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setEditingDSR(null);
          }}
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={`Delete ${deleteType === "policy" ? "Policy" : "Data Subject Request"}`}
          description={`Are you sure you want to delete this ${deleteType === "policy" ? "policy" : "data subject request"}? This action cannot be undone.`}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />

        <DeleteConfirmationDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          title="Delete Multiple Items"
          description={`Are you sure you want to delete ${bulkDeleteType === 'policy' ? selectedPolicies.length : selectedDSRs.length
            } item${(bulkDeleteType === 'policy' ? selectedPolicies.length : selectedDSRs.length) > 1 ? 's' : ''
            }? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          isDeleting={isDeleting}
        />
      </div>
    </DashboardPageLayout>
  );
}
