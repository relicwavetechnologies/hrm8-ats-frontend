import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/tables/DataTable';
import { createRPOContractsColumns } from './RPOContractsTableColumns';
import { RPOContractsFilterBar } from './RPOContractsFilterBar';
import { ServiceProject } from '@/shared/types/recruitmentService';

interface RPOContractsTableProps {
  contracts: ServiceProject[];
}

export function RPOContractsTable({ contracts }: RPOContractsTableProps) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  // Get unique countries for filter
  const countries = useMemo(() => {
    const uniqueCountries = new Set(contracts.map(c => c.country).filter(Boolean));
    return Array.from(uniqueCountries).sort();
  }, [contracts]);

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const matchesSearch = 
          contract.name.toLowerCase().includes(searchLower) ||
          contract.clientName.toLowerCase().includes(searchLower) ||
          contract.location.toLowerCase().includes(searchLower) ||
          contract.country.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && contract.status !== statusFilter) {
        return false;
      }

      // Country filter
      if (countryFilter !== 'all' && contract.country !== countryFilter) {
        return false;
      }

      return true;
    });
  }, [contracts, searchValue, statusFilter, countryFilter]);

  const handleClearFilters = () => {
    setSearchValue('');
    setStatusFilter('all');
    setCountryFilter('all');
  };

  const hasActiveFilters = searchValue !== '' || statusFilter !== 'all' || countryFilter !== 'all';

  const handleRowClick = (contract: ServiceProject) => {
    navigate(`/recruitment-services/${contract.id}`);
  };

  const columns = createRPOContractsColumns();

  return (
    <div className="space-y-4">
      <RPOContractsFilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        countryFilter={countryFilter}
        onCountryFilterChange={setCountryFilter}
        countries={countries}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <DataTable
        data={filteredContracts}
        columns={columns}
        emptyMessage="No RPO contracts found"
        onRowClick={handleRowClick}
      />
    </div>
  );
}
