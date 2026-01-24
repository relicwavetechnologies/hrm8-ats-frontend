import { Search, X, RefreshCw } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { Candidate } from "@/shared/types/entities";

interface CandidatesFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: Candidate['status'] | 'all';
  onStatusChange: (value: Candidate['status'] | 'all') => void;
  experienceLevelFilter: Candidate['experienceLevel'] | 'all';
  onExperienceLevelChange: (value: Candidate['experienceLevel'] | 'all') => void;
  workArrangementFilter: Candidate['workArrangement'] | 'all';
  onWorkArrangementChange: (value: Candidate['workArrangement'] | 'all') => void;
  sourceFilter: Candidate['source'] | 'all';
  onSourceChange: (value: Candidate['source'] | 'all') => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function CandidatesFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  experienceLevelFilter,
  onExperienceLevelChange,
  workArrangementFilter,
  onWorkArrangementChange,
  sourceFilter,
  onSourceChange,
  onClearFilters,
  activeFilterCount,
}: CandidatesFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name, email, position, skills..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="placed">Placed</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={experienceLevelFilter} onValueChange={onExperienceLevelChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Experience Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="entry">Entry</SelectItem>
            <SelectItem value="mid">Mid</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="executive">Executive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={workArrangementFilter} onValueChange={onWorkArrangementChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Work Arrangement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Arrangements</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="onsite">Onsite</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={onSourceChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="job_board">Job Board</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="agency">Agency</SelectItem>
            <SelectItem value="career_fair">Career Fair</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={onClearFilters}
          title="Reset all filters"
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
