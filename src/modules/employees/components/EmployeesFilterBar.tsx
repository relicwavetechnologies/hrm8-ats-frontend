import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Search, X } from "lucide-react";
import { DateRangePicker } from "@/shared/components/ui/date-filters";
import type { DateRange } from "react-day-picker";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

interface EmployeesFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  skillsFilter: string;
  onSkillsFilterChange: (value: string) => void;
  certificationsFilter: string;
  onCertificationsFilterChange: (value: string) => void;
  salaryMin: string;
  onSalaryMinChange: (value: string) => void;
  salaryMax: string;
  onSalaryMaxChange: (value: string) => void;
  hireDateRange: DateRange | undefined;
  onHireDateRangeChange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function EmployeesFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  locationFilter,
  onLocationFilterChange,
  skillsFilter,
  onSkillsFilterChange,
  certificationsFilter,
  onCertificationsFilterChange,
  salaryMin,
  onSalaryMinChange,
  salaryMax,
  onSalaryMaxChange,
  hireDateRange,
  onHireDateRangeChange,
  onClearFilters,
  activeFiltersCount,
}: EmployeesFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
            <SelectItem value="notice-period">Notice Period</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Human Resources">Human Resources</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={onLocationFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
            <SelectItem value="New York, NY">New York, NY</SelectItem>
            <SelectItem value="Austin, TX">Austin, TX</SelectItem>
            <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Filter by skills (e.g., React, Python)..."
          value={skillsFilter}
          onChange={(e) => onSkillsFilterChange(e.target.value)}
          className="flex-1"
        />
        
        <Input
          placeholder="Filter by certifications..."
          value={certificationsFilter}
          onChange={(e) => onCertificationsFilterChange(e.target.value)}
          className="flex-1"
        />
        
        <div className="flex gap-2 flex-1">
          <Input
            type="number"
            placeholder="Min salary"
            value={salaryMin}
            onChange={(e) => onSalaryMinChange(e.target.value)}
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Max salary"
            value={salaryMax}
            onChange={(e) => onSalaryMaxChange(e.target.value)}
            className="w-full"
          />
        </div>
        
        <DateRangePicker
          value={hireDateRange}
          onChange={onHireDateRangeChange}
          placeholder="Hire date range"
          className="w-full sm:w-[240px]"
        />
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
