import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { EmailLog } from '@/shared/types/emailTracking';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface EmailFiltersProps {
  onFilterChange: (filters: EmailFilterState) => void;
}

export interface EmailFilterState {
  status?: EmailLog['status'];
  dateFrom?: Date;
  dateTo?: Date;
}

export function EmailFilters({ onFilterChange }: EmailFiltersProps) {
  const [filters, setFilters] = useState<EmailFilterState>({});

  const handleStatusChange = (value: string) => {
    const newFilters = {
      ...filters,
      status: value === 'all' ? undefined : (value as EmailLog['status']),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    const newFilters = { ...filters, dateFrom: date };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateToChange = (date: Date | undefined) => {
    const newFilters = { ...filters, dateTo: date };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <Select onValueChange={handleStatusChange} value={filters.status || 'all'}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="sending">Sending</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {filters.dateFrom ? format(filters.dateFrom, 'MMM d') : 'From'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom}
            onSelect={handleDateFromChange}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {filters.dateTo ? format(filters.dateTo, 'MMM d') : 'To'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo}
            onSelect={handleDateToChange}
          />
        </PopoverContent>
      </Popover>

      {(filters.status || filters.dateFrom || filters.dateTo) && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
