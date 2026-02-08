import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Plus, Upload, Download, Image as ImageIcon, Users, UserCheck, UserX, UserPlus, BarChart3, List, LayoutGrid, Search, Filter, Eye } from "lucide-react";
import { DataTable } from "@/shared/components/tables/DataTable";
import { createEmployeeColumns } from "@/modules/employees/components/EmployeeTableColumns";
import { EmployeesFilterBar } from "@/modules/employees/components/EmployeesFilterBar";
import { EmployeeFormDialog } from "@/modules/employees/components/EmployeeFormDialog";
import { BulkImportDialog } from "@/modules/employees/components/BulkImportDialog";
import { ExportDialog } from "@/modules/employees/components/ExportDialog";
import { BulkPhotoUploadDialog } from "@/modules/employees/components/BulkPhotoUploadDialog";
import { BulkEditDialog } from "@/modules/employees/components/BulkEditDialog";
import { EmployeesBulkActionsToolbar } from "@/modules/employees/components/EmployeesBulkActionsToolbar";
import { EmployeesKanbanBoard } from "@/modules/employees/components/EmployeesKanbanBoard";
import { EnhancedStatCard } from "@/modules/dashboard/components/EnhancedStatCard";

import { Employee } from "@/shared/types/employee";
import { getEmployees } from "@/shared/lib/employeeStorage";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import type { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO, startOfMonth } from "date-fns";
import { useToast } from "@/shared/hooks/use-toast";

export default function HRMS() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [certificationsFilter, setCertificationsFilter] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [hireDateRange, setHireDateRange] = useState<DateRange | undefined>();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [bulkPhotoDialogOpen, setBulkPhotoDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      const data = await getEmployees();
      setEmployees(data);
      setIsLoading(false);
    };
    fetchEmployees();
  }, [refreshKey]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch =
        employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
      const matchesLocation = locationFilter === "all" || employee.location === locationFilter;

      // Skills filter - check if employee has any matching skill
      const matchesSkills = !skillsFilter ||
        (employee.skills && employee.skills.some(skill =>
          skill.toLowerCase().includes(skillsFilter.toLowerCase())
        ));

      // Certifications filter - check if employee has any matching certification
      const matchesCertifications = !certificationsFilter ||
        (employee.certifications && employee.certifications.some(cert =>
          cert.toLowerCase().includes(certificationsFilter.toLowerCase())
        ));

      // Salary range filter
      const minSalary = salaryMin ? parseFloat(salaryMin) : null;
      const maxSalary = salaryMax ? parseFloat(salaryMax) : null;
      const matchesSalary =
        (!minSalary || employee.salary >= minSalary) &&
        (!maxSalary || employee.salary <= maxSalary);

      // Hire date range filter
      const matchesHireDate = !hireDateRange?.from || (() => {
        try {
          const hireDate = parseISO(employee.hireDate);
          const from = hireDateRange.from;
          const to = hireDateRange.to || hireDateRange.from;
          return isWithinInterval(hireDate, { start: from, end: to });
        } catch {
          return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDepartment && matchesLocation &&
        matchesSkills && matchesCertifications && matchesSalary && matchesHireDate;
    });
  }, [employees, searchQuery, statusFilter, departmentFilter, locationFilter,
    skillsFilter, certificationsFilter, salaryMin, salaryMax, hireDateRange]);

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setFormDialogOpen(false);
    setEditingEmployee(undefined);
  };

  const employeeColumns = useMemo(() => createEmployeeColumns({
    onEdit: handleEditEmployee,
  }), []);

  const activeFiltersCount = [
    statusFilter !== "all",
    departmentFilter !== "all",
    locationFilter !== "all",
    skillsFilter,
    certificationsFilter,
    salaryMin,
    salaryMax,
    hireDateRange?.from
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setStatusFilter("all");
    setDepartmentFilter("all");
    setLocationFilter("all");
    setSkillsFilter("");
    setCertificationsFilter("");
    setSalaryMin("");
    setSalaryMax("");
    setHireDateRange(undefined);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);

    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      onLeave: employees.filter(e => e.status === 'on-leave').length,
      newHires: employees.filter(e => {
        try {
          const hireDate = parseISO(e.hireDate);
          return hireDate >= monthStart;
        } catch {
          return false;
        }
      }).length,
    };
  }, [employees]);

  // Bulk action handlers
  const handleBulkStatusUpdate = (status: string) => {
    toast({
      title: "Status updated",
      description: `${selectedEmployeeIds.length} employee(s) status updated.`,
    });
    setSelectedEmployeeIds([]);
    setSelectedEmployees([]);
  };

  const handleBulkDepartmentUpdate = (department: string) => {
    toast({
      title: "Department updated",
      description: `${selectedEmployeeIds.length} employee(s) department updated.`,
    });
    setSelectedEmployeeIds([]);
    setSelectedEmployees([]);
  };

  const handleBulkLocationUpdate = (location: string) => {
    toast({
      title: "Location updated",
      description: `${selectedEmployeeIds.length} employee(s) location updated.`,
    });
    setSelectedEmployeeIds([]);
    setSelectedEmployees([]);
  };

  const handleBulkExport = () => {
    setExportDialogOpen(true);
  };

  const handleBulkArchive = () => {
    toast({
      title: "Employees archived",
      description: `${selectedEmployeeIds.length} employee(s) archived.`,
    });
    setSelectedEmployeeIds([]);
    setSelectedEmployees([]);
  };

  const handleBulkDelete = () => {
    setSelectedEmployeeIds([]);
    setSelectedEmployees([]);
  };

  return (
    <DashboardPageLayout
      breadcrumbActions={
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
              <DropdownMenuItem onClick={() => setBulkImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Employees (CSV/Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBulkPhotoDialogOpen(true)}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Import Photos (ZIP)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Records</h1>
            <p className="text-muted-foreground">
              Manage employee information, documents, and history
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center border rounded-lg p-1 gap-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
            <Button asChild>
              <Link to="/employees/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/hrms">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Employees"
            value={stats.total.toString()}
            change={`${stats.active} currently active`}
            icon={<Users className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              {
                label: "View All Employees",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => navigate('/employees')
              },
              {
                label: "Add Employee",
                icon: <Plus className="h-4 w-4" />,
                onClick: () => navigate('/employees/new')
              },
              {
                label: "Export",
                icon: <Download className="h-4 w-4" />,
                onClick: () => setExportDialogOpen(true)
              }
            ]}
          />
          <EnhancedStatCard
            title="Active"
            value={stats.active.toString()}
            change={`${stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}% of workforce`}
            icon={<UserCheck className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              {
                label: "View Active",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { setStatusFilter('active'); }
              },
              {
                label: "Filter by Status",
                icon: <Filter className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
          <EnhancedStatCard
            title="On Leave"
            value={stats.onLeave.toString()}
            change="Currently on leave"
            icon={<UserX className="h-6 w-6" />}
            variant="warning"
            showMenu={true}
            menuItems={[
              {
                label: "View on Leave",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => { setStatusFilter('on-leave'); }
              },
              {
                label: "Approve Leave",
                icon: <UserCheck className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
          <EnhancedStatCard
            title="New Hires"
            value={stats.newHires.toString()}
            change="This month"
            icon={<UserPlus className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              {
                label: "View New Hires",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => navigate('/employees')
              },
              {
                label: "Onboarding Tasks",
                icon: <List className="h-4 w-4" />,
                onClick: () => { }
              }
            ]}
          />
        </div>

        {/* Bulk Actions Toolbar */}
        {viewMode === 'list' && (
          <EmployeesBulkActionsToolbar
            selectedCount={selectedEmployeeIds.length}
            onClearSelection={() => {
              setSelectedEmployeeIds([]);
              setSelectedEmployees([]);
            }}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onBulkDepartmentUpdate={handleBulkDepartmentUpdate}
            onBulkLocationUpdate={handleBulkLocationUpdate}
            onBulkExport={handleBulkExport}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
          />
        )}

        {/* Advanced Search Buttons */}
        {viewMode === 'list' && (
          <div className="flex gap-2">
            <Button
              variant={showAdvancedSearch ? "default" : "outline"}
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              <Search className="mr-2 h-4 w-4" />
              Advanced Search
            </Button>
            <Button
              variant={showSearchPanel ? "default" : "outline"}
              onClick={() => setShowSearchPanel(!showSearchPanel)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Saved & History
            </Button>
          </div>
        )}

        {showAdvancedSearch && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Advanced search builder coming soon. Use the filter bar below for now.
            </p>
          </div>
        )}

        {showSearchPanel && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Saved searches and history coming soon.
            </p>
          </div>
        )}

        {viewMode === 'list' && (
          <EmployeesFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            departmentFilter={departmentFilter}
            onDepartmentFilterChange={setDepartmentFilter}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
            skillsFilter={skillsFilter}
            onSkillsFilterChange={setSkillsFilter}
            certificationsFilter={certificationsFilter}
            onCertificationsFilterChange={setCertificationsFilter}
            salaryMin={salaryMin}
            onSalaryMinChange={setSalaryMin}
            salaryMax={salaryMax}
            onSalaryMaxChange={setSalaryMax}
            hireDateRange={hireDateRange}
            onHireDateRangeChange={setHireDateRange}
            onClearFilters={handleClearFilters}
            activeFiltersCount={activeFiltersCount}
          />
        )}

        {viewMode === 'list' && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <DataTable
                columns={employeeColumns}
                data={filteredEmployees}
                selectable
                onSelectedRowsChange={(ids) => {
                  const selected = filteredEmployees.filter(emp => ids.includes(emp.id));
                  setSelectedEmployees(selected);
                  setSelectedEmployeeIds(ids);
                }}
              />
            )}
          </>
        )}

        {viewMode === 'kanban' && (
          <EmployeesKanbanBoard />
        )}

        <EmployeeFormDialog
          open={formDialogOpen}
          onOpenChange={handleCloseDialog}
          employee={editingEmployee}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />

        <BulkImportDialog
          open={bulkImportDialogOpen}
          onOpenChange={setBulkImportDialogOpen}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />

        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          selectedEmployees={selectedEmployees.length > 0 ? selectedEmployees : undefined}
        />

        <BulkPhotoUploadDialog
          open={bulkPhotoDialogOpen}
          onOpenChange={setBulkPhotoDialogOpen}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />

        <BulkEditDialog
          open={bulkEditDialogOpen}
          onOpenChange={setBulkEditDialogOpen}
          selectedEmployees={selectedEmployees}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setSelectedEmployees([]);
          }}
        />
      </div>
    </DashboardPageLayout>
  );
}
