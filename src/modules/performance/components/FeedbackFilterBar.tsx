import { useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';

interface FeedbackFilterBarProps {
  feedback: TeamMemberFeedback[];
  onFilteredChange: (filtered: TeamMemberFeedback[]) => void;
}

export function FeedbackFilterBar({ feedback, onFilteredChange }: FeedbackFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  const applyFilters = (
    search: string,
    recommendation: string,
    score: string
  ) => {
    let filtered = [...feedback];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        f =>
          f.reviewerName.toLowerCase().includes(searchLower) ||
          f.comments.some(c => c.content.toLowerCase().includes(searchLower))
      );
    }

    // Recommendation filter
    if (recommendation !== 'all') {
      filtered = filtered.filter(f => f.recommendation === recommendation);
    }

    // Score filter
    if (score !== 'all') {
      filtered = filtered.filter(f => {
        switch (score) {
          case 'high':
            return f.overallScore >= 80;
          case 'medium':
            return f.overallScore >= 60 && f.overallScore < 80;
          case 'low':
            return f.overallScore < 60;
          default:
            return true;
        }
      });
    }

    onFilteredChange(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, recommendationFilter, scoreFilter);
  };

  const handleRecommendationChange = (value: string) => {
    setRecommendationFilter(value);
    applyFilters(searchTerm, value, scoreFilter);
  };

  const handleScoreChange = (value: string) => {
    setScoreFilter(value);
    applyFilters(searchTerm, recommendationFilter, value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRecommendationFilter('all');
    setScoreFilter('all');
    onFilteredChange(feedback);
  };

  const hasActiveFilters =
    searchTerm !== '' || recommendationFilter !== 'all' || scoreFilter !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by reviewer name or comments..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by:</span>
        </div>

        <Select value={recommendationFilter} onValueChange={handleRecommendationChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Recommendation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recommendations</SelectItem>
            <SelectItem value="strong-hire">Strong Hire</SelectItem>
            <SelectItem value="hire">Hire</SelectItem>
            <SelectItem value="maybe">Maybe</SelectItem>
            <SelectItem value="no-hire">No Hire</SelectItem>
            <SelectItem value="strong-no-hire">Strong No Hire</SelectItem>
          </SelectContent>
        </Select>

        <Select value={scoreFilter} onValueChange={handleScoreChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Score Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="high">High (80+)</SelectItem>
            <SelectItem value="medium">Medium (60-79)</SelectItem>
            <SelectItem value="low">Low (&lt;60)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
