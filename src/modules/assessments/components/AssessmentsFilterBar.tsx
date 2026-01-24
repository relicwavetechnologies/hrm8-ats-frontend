import { SearchInput } from '@/shared/components/common/SearchInput';
import { FilterDropdown } from '@/shared/components/common/FilterDropdown';
import { Button } from '@/shared/components/ui/button';
import { X } from 'lucide-react';

interface AssessmentsFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  providerFilter: string;
  onProviderChange: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function AssessmentsFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  providerFilter,
  onProviderChange,
  onClearFilters,
  activeFilterCount,
}: AssessmentsFilterBarProps) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending-invitation', label: 'Pending Invitation' },
    { value: 'invited', label: 'Invited' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'cognitive', label: 'Cognitive Ability' },
    { value: 'personality', label: 'Personality' },
    { value: 'technical-skills', label: 'Technical Skills' },
    { value: 'situational-judgment', label: 'Situational Judgment' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'culture-fit', label: 'Culture Fit' },
    { value: 'custom', label: 'Custom' },
  ];

  const providerOptions = [
    { value: 'all', label: 'All Providers' },
    { value: 'testgorilla', label: 'TestGorilla' },
    { value: 'vervoe', label: 'Vervoe' },
    { value: 'criteria', label: 'Criteria Corp' },
    { value: 'harver', label: 'Harver' },
    { value: 'shl', label: 'SHL' },
    { value: 'codility', label: 'Codility' },
    { value: 'internal', label: 'Internal' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search by candidate name or ID..."
        className="flex-1"
      />
      
      <div className="flex gap-2 flex-wrap">
        <FilterDropdown
          label="Status"
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusChange}
        />

        <FilterDropdown
          label="Type"
          options={typeOptions}
          value={typeFilter}
          onChange={onTypeChange}
        />

        <FilterDropdown
          label="Provider"
          options={providerOptions}
          value={providerFilter}
          onChange={onProviderChange}
        />

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}
