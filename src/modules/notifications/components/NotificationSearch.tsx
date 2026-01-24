import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { NotificationFilters } from '@/shared/lib/notificationStorage';
import { Badge } from '@/shared/components/ui/badge';

interface NotificationSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: NotificationFilters) => void;
  filters: NotificationFilters;
  searchQuery: string;
}

export function NotificationSearch({ 
  onSearch, 
  onFilterChange, 
  filters,
  searchQuery 
}: NotificationSearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearch = (value: string) => {
    setLocalQuery(value);
    onSearch(value);
  };

  const clearFilters = () => {
    onFilterChange({});
    setLocalQuery('');
    onSearch('');
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={localQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {localQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.read === false ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onFilterChange({ ...filters, read: filters.read === false ? undefined : false })}
                    >
                      Unread
                    </Button>
                    <Button
                      variant={filters.read === true ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onFilterChange({ ...filters, read: filters.read === true ? undefined : true })}
                    >
                      Read
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) => 
                      onFilterChange({ ...filters, category: value === 'all' ? undefined : value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="approval">Approval</SelectItem>
                      <SelectItem value="expiry">Expiry</SelectItem>
                      <SelectItem value="payroll">Payroll</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={filters.priority || 'all'}
                    onValueChange={(value) => 
                      onFilterChange({ ...filters, priority: value === 'all' ? undefined : value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => 
                      onFilterChange({ ...filters, type: value === 'all' ? undefined : value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="archived"
                    checked={filters.archived === true}
                    onCheckedChange={(checked) => 
                      onFilterChange({ ...filters, archived: checked ? true : undefined })
                    }
                  />
                  <Label htmlFor="archived" className="text-sm font-normal cursor-pointer">
                    Show archived
                  </Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
