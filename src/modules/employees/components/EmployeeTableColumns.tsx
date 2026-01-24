import { Column } from "@/components/tables/DataTable";
import { Employee } from "@/shared/types/employee";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { EmploymentTypeBadge } from "./EmploymentTypeBadge";
import { EntityAvatar } from "@/components/tables/EntityAvatar";
import { Button } from "@/shared/components/ui/button";
import { MoreVertical, Eye, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface EmployeeColumnsOptions {
  onEdit?: (employee: Employee) => void;
}

export const createEmployeeColumns = (options?: EmployeeColumnsOptions): Column<Employee>[] => [
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (employee) => (
      <div className="flex items-center gap-3">
        <EntityAvatar
          name={`${employee.firstName} ${employee.lastName}`}
          src={employee.avatar}
          type="person"
          size="md"
        />
        <div className="min-w-0 flex-1">
          <Link
            to={`/employees/${employee.id}`}
            className="font-semibold text-base hover:underline cursor-pointer line-clamp-1 block"
          >
            {employee.firstName} {employee.lastName}
          </Link>
          <div className="text-sm text-muted-foreground truncate">{employee.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "employeeId",
    label: "Employee ID",
    sortable: true,
    render: (employee) => (
      <span className="font-mono text-sm">{employee.employeeId}</span>
    ),
  },
  {
    key: "jobTitle",
    label: "Job Title",
    sortable: true,
  },
  {
    key: "department",
    label: "Department",
    sortable: true,
  },
  {
    key: "phone",
    label: "Phone",
    sortable: true,
    render: (employee) => (
      <span className="text-sm">{employee.phone || "-"}</span>
    ),
  },
  {
    key: "location",
    label: "Location",
    sortable: true,
  },
  {
    key: "address",
    label: "Address",
    sortable: true,
    render: (employee) => (
      <span className="text-sm truncate max-w-[150px] block" title={employee.address}>
        {employee.address || "-"}
      </span>
    ),
  },
  {
    key: "employmentType",
    label: "Type",
    sortable: true,
    render: (employee) => <EmploymentTypeBadge type={employee.employmentType} />,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (employee) => <EmployeeStatusBadge status={employee.status} />,
  },
  {
    key: "hireDate",
    label: "Hire Date",
    sortable: true,
    render: (employee) => format(new Date(employee.hireDate), "MMM d, yyyy"),
  },
  {
    key: "actions",
    label: "Actions",
    width: "80px",
    render: (employee) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background">
          <DropdownMenuItem asChild>
            <Link to={`/employees/${employee.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          {options?.onEdit && (
            <DropdownMenuItem onClick={() => options.onEdit!(employee)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Employee
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
