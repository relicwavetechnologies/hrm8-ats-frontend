import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, History, Trash2, Search } from "lucide-react";
import { getSearchHistory, clearSearchHistory, type SearchHistory } from "@/shared/lib/savedSearchService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SearchHistoryPanelProps {
  onSelectHistory: (history: SearchHistory) => void;
}

export function SearchHistoryPanel({ onSelectHistory }: SearchHistoryPanelProps) {
  const [history, setHistory] = useState<SearchHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getSearchHistory(20));
  };

  const handleSelect = (item: SearchHistory) => {
    onSelectHistory(item);
    toast.success("Search restored");
  };

  const handleClearHistory = () => {
    if (confirm("Clear all search history?")) {
      clearSearchHistory();
      toast.success("History cleared");
      loadHistory();
    }
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Search History
          </CardTitle>
          <CardDescription>No recent searches</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Search History
            </CardTitle>
            <CardDescription>
              {history.length} recent search{history.length !== 1 ? 'es' : ''}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.map((item) => (
          <Card 
            key={item.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleSelect(item)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {item.searchQuery || 'Advanced search'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.resultCount} result{item.resultCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
