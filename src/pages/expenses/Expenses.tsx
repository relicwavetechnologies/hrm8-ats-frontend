import { useState, useMemo } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Receipt, DollarSign, Clock, CheckCircle, XCircle, Plus, Download, Eye } from "lucide-react";
import { getExpenses, calculateExpenseStats } from "@/shared/lib/expenseStorage";
import { Badge } from "@/shared/components/ui/badge";
import { format } from "date-fns";
import { ExpenseSubmissionDialog } from "@/shared/components/expenses/ExpenseSubmissionDialog";
import { ExpenseApprovalActions } from "@/shared/components/expenses/ExpenseApprovalActions";
import { ExpenseDetailDialog } from "@/shared/components/expenses/ExpenseDetailDialog";
import { ExportButton } from "@/shared/components/common/ExportButton";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterDropdown } from "@/shared/components/common/FilterDropdown";
import type { Expense } from "@/shared/types/expense";

export default function Expenses() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const expenses = useMemo(() => getExpenses(), [refreshKey]);
  const stats = useMemo(() => calculateExpenseStats(), [refreshKey]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = 
        expense.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [expenses, searchQuery, statusFilter, categoryFilter]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setDetailDialogOpen(true);
  };

  const myExpenses = expenses.filter(e => e.employeeId === 'current-user');
  const pendingApprovals = expenses.filter(e => e.status === 'submitted');

  return (
    <DashboardPageLayout>
      <div className="space-y-6 p-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-muted-foreground">Submit and manage expense claims and reimbursements</p>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.approvedAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reimbursed</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.reimbursedAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.rejectedAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="my-expenses" className="space-y-4">
          <div className="text-base font-semibold flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="my-expenses">My Expenses</TabsTrigger>
              <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
              <TabsTrigger value="all">All Expenses</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <ExportButton 
                data={filteredExpenses} 
                filename="expense_claims"
                fields={['employeeName', 'date', 'category', 'merchant', 'amount', 'status']}
              />
              <Button size="sm" onClick={() => setExpenseDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Expense
              </Button>
            </div>
          </div>

          <TabsContent value="my-expenses" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <SearchInput 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search expenses..."
                className="flex-1 max-w-md"
              />
              <FilterDropdown 
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: 'Submitted', value: 'submitted' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Rejected', value: 'rejected' },
                  { label: 'Reimbursed', value: 'reimbursed' },
                ]}
              />
              <FilterDropdown 
                label="Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { label: 'Travel', value: 'travel' },
                  { label: 'Meals', value: 'meals' },
                  { label: 'Accommodation', value: 'accommodation' },
                  { label: 'Supplies', value: 'supplies' },
                  { label: 'Equipment', value: 'equipment' },
                ]}
              />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">My Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredExpenses.slice(0, 10).map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{expense.merchant}</p>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="capitalize">
                          {expense.category}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold">${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                          <p className="text-xs text-muted-foreground">{expense.currency}</p>
                        </div>
                        <Badge
                          variant={
                            expense.status === 'approved' ? 'default' :
                            expense.status === 'rejected' ? 'destructive' :
                            expense.status === 'reimbursed' ? 'secondary' : 'outline'
                          }
                        >
                          {expense.status}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(expense)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingApprovals.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{expense.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{expense.merchant} - {expense.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="capitalize">
                          {expense.category}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold">${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>
                        <ExpenseApprovalActions expenseId={expense.id} onUpdate={handleRefresh} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">All Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete expense history and reports</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Expense Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Expense policies and approval rules</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ExpenseSubmissionDialog 
          open={expenseDialogOpen} 
          onOpenChange={setExpenseDialogOpen}
          onSuccess={handleRefresh}
        />
        <ExpenseDetailDialog 
          open={detailDialogOpen} 
          onOpenChange={setDetailDialogOpen}
          expense={selectedExpense}
        />
      </div>
    </DashboardPageLayout>
  );
}
