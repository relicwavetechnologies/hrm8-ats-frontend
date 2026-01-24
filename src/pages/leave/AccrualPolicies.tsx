import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Clock, Plus, Play, TrendingUp, Calendar, FileText, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useRBAC } from "@/shared/hooks/useRBAC";
import { getAccrualPolicies, getAccrualTransactions, processMonthlyAccruals, deleteAccrualPolicy } from "@/shared/lib/accrualStorage";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, Column } from "@/components/tables/DataTable";
import { AccrualPolicy, AccrualTransaction } from "@/shared/types/accrual";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { toast } from "sonner";
import { AccrualPolicyDialog } from "@/components/accrual/AccrualPolicyDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

export default function AccrualPolicies() {
  const { isHRAdmin, isSuperAdmin } = useRBAC();
  const [activeTab, setActiveTab] = useState("policies");
  const [processing, setProcessing] = useState(false);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AccrualPolicy | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<AccrualPolicy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const policies = getAccrualPolicies();
  const transactions = getAccrualTransactions();

  const hasAccess = isHRAdmin || isSuperAdmin;

  const policyColumns: Column<AccrualPolicy>[] = [
    {
      key: "name",
      label: "Policy Name",
      sortable: true,
    },
    {
      key: "leaveTypeName",
      label: "Leave Type",
      sortable: true,
      render: (policy) => (
        <Badge variant="secondary">{policy.leaveTypeName}</Badge>
      ),
    },
    {
      key: "accrualMethod",
      label: "Method",
      sortable: true,
      render: (policy) => (
        <Badge variant="outline">{policy.accrualMethod}</Badge>
      ),
    },
    {
      key: "accrualRate",
      label: "Rate",
      sortable: true,
      render: (policy) => `${policy.accrualRate} days/${policy.accrualFrequency}`,
    },
    {
      key: "maxAccrual",
      label: "Max Accrual",
      sortable: true,
      render: (policy) => policy.maxAccrual ? `${policy.maxAccrual} days` : "Unlimited",
    },
    {
      key: "carryoverAllowed",
      label: "Carryover",
      render: (policy) => (
        <Badge variant={policy.carryoverAllowed ? "default" : "secondary"}>
          {policy.carryoverAllowed ? `${policy.maxCarryover || 'Unlimited'} days` : 'No'}
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (policy) => (
        <Badge variant={policy.isActive ? "default" : "secondary"}>
          {policy.isActive ? "Active" : "Inactive"}
        </Badge>
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
                setPolicyToDelete(policy);
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

  const transactionColumns: Column<AccrualTransaction>[] = [
    {
      key: "employeeName",
      label: "Employee",
      sortable: true,
    },
    {
      key: "leaveTypeName",
      label: "Leave Type",
      sortable: true,
    },
    {
      key: "transactionType",
      label: "Type",
      sortable: true,
      render: (txn) => {
        const colors = {
          accrual: "bg-green-50 text-green-700",
          adjustment: "bg-blue-50 text-blue-700",
          carryover: "bg-purple-50 text-purple-700",
          expiry: "bg-orange-50 text-orange-700",
          usage: "bg-red-50 text-red-700",
        };
        return <Badge className={colors[txn.transactionType]}>{txn.transactionType}</Badge>;
      },
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (txn) => `${txn.amount > 0 ? '+' : ''}${txn.amount} days`,
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      render: (txn) => `${txn.balance} days`,
    },
    {
      key: "effectiveDate",
      label: "Effective Date",
      sortable: true,
      render: (txn) => new Date(txn.effectiveDate).toLocaleDateString(),
    },
  ];

  const handleRunAccruals = async () => {
    setProcessing(true);
    try {
      const processed = processMonthlyAccruals();
      toast.success(`Processed accruals for ${processed} policies`);
    } catch (error) {
      toast.error("Failed to process accruals");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePolicy = () => {
    if (!policyToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = deleteAccrualPolicy(policyToDelete.id);
      if (success) {
        toast.success("Accrual policy deleted successfully");
        setDeleteDialogOpen(false);
        setPolicyToDelete(null);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Failed to delete policy");
      }
    } catch (error) {
      toast.error("Failed to delete policy");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    setIsDeleting(true);
    try {
      let successCount = 0;
      selectedPolicies.forEach((id) => {
        if (deleteAccrualPolicy(id)) {
          successCount++;
        }
      });
      
      toast.success(`Successfully deleted ${successCount} polic${successCount > 1 ? 'ies' : 'y'}`);
      setBulkDeleteDialogOpen(false);
      setSelectedPolicies([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to delete policies");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!hasAccess) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Access Restricted</p>
                  <p className="text-sm">You don't have permission to manage accrual policies.</p>
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
              <Clock className="h-8 w-8" />
              Accrual Policies
            </h1>
            <p className="text-muted-foreground">
              Automate time-off accruals and manage carryover rules
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRunAccruals} disabled={processing}>
              <Play className="h-4 w-4 mr-2" />
              {processing ? "Processing..." : "Run Accruals"}
            </Button>
            <Button onClick={() => setPolicyDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Policies</p>
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
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Run</p>
                  <p className="text-2xl font-bold">3 days</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Accrual</p>
                  <p className="text-2xl font-bold">1.5 days</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="simulator">Simulator</TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Accrual Policies</CardTitle>
                <CardDescription>
                  {policies.length === 0
                    ? "No policies configured. Create your first policy to automate accruals."
                    : `Managing ${policies.length} active accrual polic${policies.length > 1 ? 'ies' : 'y'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {policies.length > 0 ? (
                  <DataTable
                    columns={policyColumns}
                    data={policies}
                    searchKeys={["name", "leaveTypeName"]}
                    selectable={true}
                    onSelectedRowsChange={setSelectedPolicies}
                    exportable={true}
                    exportFilename="accrual-policies"
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
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Policies Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first accrual policy to automate time-off calculations
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Policy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Accrual Transactions</CardTitle>
                <CardDescription>History of all accrual calculations and adjustments</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <DataTable
                    columns={transactionColumns}
                    data={transactions}
                    searchKeys={["employeeName", "leaveTypeName"]}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No transactions yet. Accruals will appear here once processed.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Accrual Schedules</CardTitle>
                <CardDescription>Automated processing schedules for each policy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div key={policy.id} className="p-4 rounded-lg border">
                      <div className="text-base font-semibold flex items-center justify-between">
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Runs {policy.accrualFrequency} • Next: 1st of next month
                          </p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Accrual Simulator</CardTitle>
                <CardDescription>
                  Test policy changes before applying them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Accrual simulator will allow you to model policy changes and see projected balances.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AccrualPolicyDialog
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
        
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Accrual Policy"
          description={`Are you sure you want to delete "${policyToDelete?.name}"? This action cannot be undone.`}
          onConfirm={handleDeletePolicy}
          isDeleting={isDeleting}
        />
        
        <DeleteConfirmationDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          title="Delete Multiple Policies"
          description={`Are you sure you want to delete ${selectedPolicies.length} polic${selectedPolicies.length > 1 ? 'ies' : 'y'}? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          isDeleting={isDeleting}
        />
      </div>
    </DashboardPageLayout>
  );
}
