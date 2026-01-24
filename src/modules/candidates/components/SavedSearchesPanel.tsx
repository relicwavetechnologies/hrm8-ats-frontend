import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, Star, Trash2, Search, TrendingUp } from "lucide-react";
import { 
  getSavedSearches, 
  deleteSavedSearch, 
  recordSearchUsage,
  updateSavedSearch,
  type SavedSearch 
} from "@/shared/lib/savedSearchService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SavedSearchesPanelProps {
  onSelectSearch: (search: SavedSearch) => void;
}

export function SavedSearchesPanel({ onSelectSearch }: SavedSearchesPanelProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = () => {
    const allSearches = getSavedSearches();
    setSearches(allSearches.sort((a, b) => b.useCount - a.useCount));
  };

  const handleSelect = (search: SavedSearch) => {
    recordSearchUsage(search.id);
    onSelectSearch(search);
    toast.success(`Applied search: ${search.name}`);
    loadSearches();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete saved search "${name}"?`)) {
      deleteSavedSearch(id);
      toast.success("Search deleted");
      loadSearches();
    }
  };

  const toggleDefault = (search: SavedSearch) => {
    updateSavedSearch(search.id, { isDefault: !search.isDefault });
    toast.success(search.isDefault ? "Removed from defaults" : "Set as default");
    loadSearches();
  };

  if (searches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Saved Searches
          </CardTitle>
          <CardDescription>No saved searches yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Build a search using the Advanced Search Builder and save it for quick access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Saved Searches
        </CardTitle>
        <CardDescription>
          {searches.length} saved search{searches.length !== 1 ? 'es' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {searches.map((search) => (
          <Card 
            key={search.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleSelect(search)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">{search.name}</CardTitle>
                    {search.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  {search.description && (
                    <CardDescription className="text-sm">
                      {search.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleDefault(search)}
                  >
                    <Star 
                      className={`h-4 w-4 ${search.isDefault ? 'fill-current text-warning' : ''}`} 
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(search.id, search.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Used {search.useCount} time{search.useCount !== 1 ? 's' : ''}
                </div>
                {search.lastUsed && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(search.lastUsed, { addSuffix: true })}
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {search.groups.length} group{search.groups.length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {search.groups.reduce((sum, g) => sum + g.conditions.length, 0)} condition{search.groups.reduce((sum, g) => sum + g.conditions.length, 0) !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {search.globalOperator}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
