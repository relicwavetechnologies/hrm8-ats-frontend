import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, X, Save, Search } from "lucide-react";
import type { SearchCondition, SearchGroup } from "@/shared/lib/savedSearchService";
import { createSavedSearch } from "@/shared/lib/savedSearchService";
import { toast } from "sonner";

interface AdvancedSearchBuilderProps {
  onSearch: (groups: SearchGroup[], globalOperator: 'AND' | 'OR') => void;
  onClose?: () => void;
}

const fieldOptions = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'skills', label: 'Skills' },
  { value: 'position', label: 'Position' },
  { value: 'location', label: 'Location' },
  { value: 'experienceLevel', label: 'Experience Level' },
  { value: 'status', label: 'Status' },
  { value: 'source', label: 'Source' },
  { value: 'tags', label: 'Tags' },
];

const operatorOptions = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'in', label: 'In List' },
  { value: 'not_in', label: 'Not In List' },
];

export function AdvancedSearchBuilder({ onSearch, onClose }: AdvancedSearchBuilderProps) {
  const [groups, setGroups] = useState<SearchGroup[]>([
    {
      id: 'group-1',
      conditions: [
        {
          id: 'cond-1',
          field: 'name',
          operator: 'contains',
          value: '',
        },
      ],
      logicalOperator: 'AND',
    },
  ]);
  const [globalOperator, setGlobalOperator] = useState<'AND' | 'OR'>('AND');
  const [searchName, setSearchName] = useState('');

  const addGroup = () => {
    const newGroup: SearchGroup = {
      id: `group-${Date.now()}`,
      conditions: [
        {
          id: `cond-${Date.now()}`,
          field: 'name',
          operator: 'contains',
          value: '',
        },
      ],
      logicalOperator: 'AND',
    };
    setGroups([...groups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    if (groups.length === 1) {
      toast.error("Must have at least one search group");
      return;
    }
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const addCondition = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: [
            ...group.conditions,
            {
              id: `cond-${Date.now()}`,
              field: 'name',
              operator: 'contains',
              value: '',
              logicalOperator: 'AND',
            },
          ],
        };
      }
      return group;
    }));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        if (group.conditions.length === 1) {
          toast.error("Must have at least one condition per group");
          return group;
        }
        return {
          ...group,
          conditions: group.conditions.filter(c => c.id !== conditionId),
        };
      }
      return group;
    }));
  };

  const updateCondition = (groupId: string, conditionId: string, updates: Partial<SearchCondition>) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.map(cond => 
            cond.id === conditionId ? { ...cond, ...updates } : cond
          ),
        };
      }
      return group;
    }));
  };

  const updateGroupOperator = (groupId: string, operator: 'AND' | 'OR') => {
    setGroups(groups.map(group => 
      group.id === groupId ? { ...group, logicalOperator: operator } : group
    ));
  };

  const handleSearch = () => {
    onSearch(groups, globalOperator);
  };

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast.error("Please enter a name for this search");
      return;
    }

    createSavedSearch(searchName, groups, globalOperator);
    toast.success("Search saved successfully");
    setSearchName('');
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search Builder
            </CardTitle>
            <CardDescription>
              Build complex queries with Boolean operators
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Operator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Match</span>
          <Select value={globalOperator} onValueChange={(v) => setGlobalOperator(v as 'AND' | 'OR')}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">ALL</SelectItem>
              <SelectItem value="OR">ANY</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">of these groups:</span>
        </div>

        {/* Search Groups */}
        <div className="space-y-4">
          {groups.map((group, groupIndex) => (
            <Card key={group.id} className="bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Group {groupIndex + 1}</Badge>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={group.logicalOperator} 
                      onValueChange={(v) => updateGroupOperator(group.id, v as 'AND' | 'OR')}
                    >
                      <SelectTrigger className="h-8 w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeGroup(group.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.conditions.map((condition, condIndex) => (
                  <div key={condition.id} className="flex items-center gap-2">
                    {condIndex > 0 && (
                      <Badge variant="secondary" className="shrink-0">
                        {group.logicalOperator}
                      </Badge>
                    )}
                    <Select 
                      value={condition.field} 
                      onValueChange={(v) => updateCondition(group.id, condition.id, { field: v as any })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select 
                      value={condition.operator} 
                      onValueChange={(v) => updateCondition(group.id, condition.id, { operator: v as any })}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operatorOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value..."
                      value={condition.value}
                      onChange={(e) => updateCondition(group.id, condition.id, { value: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(group.id, condition.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCondition(group.id)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="outline" onClick={addGroup} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>

        {/* Save Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Save this search as..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <Button variant="outline" onClick={handleSaveSearch}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
