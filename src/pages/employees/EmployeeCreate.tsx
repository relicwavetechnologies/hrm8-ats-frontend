import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { EmployeeFormWizard } from "@/modules/employees/components/EmployeeFormWizard";
import { saveEmployee } from "@/shared/lib/employeeStorage";
import type { Employee } from "@/shared/types/employee";

export default function EmployeeCreate() {
  const navigate = useNavigate();

  const handleSave = async (data: Partial<Employee>) => {
    const employeeId = `EMP${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const newEmployee: Employee = {
      id: employeeId,
      employeeId: employeeId,
      ...data as Employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Current User",
    };

    saveEmployee(newEmployee);
    navigate(`/employees/${employeeId}`);
  };

  const handleCancel = () => {
    navigate('/employees');
  };

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Add New Employee</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add New Employee</h1>
              <p className="text-muted-foreground">Create a new employee record</p>
            </div>
          </div>
        </div>

        <EmployeeFormWizard onSave={handleSave} onCancel={handleCancel} />
      </div>
    </DashboardPageLayout>
  );
}
