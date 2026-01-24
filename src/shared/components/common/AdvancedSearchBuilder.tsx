import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { X, Plus, Save, Search } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { createSavedSearch } from "@/shared/lib/savedSearchService";

// Generic search types for the builder
interface GenericSearchCondition {
  id: string;
  field: string;
  operator: 'contains' | 'equals' | 'not_equals' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | string[] | number;
  logicalOperator?: 'AND' | 'OR';
}

interface GenericSearchGroup {
  id: string;
  conditions: GenericSearchCondition[];
  logicalOperator: 'AND' | 'OR';
}

interface AdvancedSearchBuilderProps {
  fields: Array<{
    value: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'multi-select';
    options?: string[];
  }>;
  onSearch: (groups: GenericSearchGroup[], globalOperator: 'AND' | 'OR') => void;
  onClose: () => void;
  onSave?: (searchId: string) => void;
}

export function AdvancedSearchBuilder({ 
  fields, 
  onSearch, 
  onClose,
  onSave 
}: AdvancedSearchBuilderProps) {
  const { toast } = useToast();
  const [groups, setGroups] = useState<GenericSearchGroup[]>([
    {
      id: 'group-1',
      conditions: [
        {
          id: 'cond-1',
          field: fields[0]?.value || 'name',
          operator: 'contains',
          value: '',
        },
      ],
      logicalOperator: 'AND',
    },
  ]);
  const [globalOperator, setGlobalOperator] = useState<'AND' | 'OR'>('AND');
  const [searchName, setSearchName] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const getOperatorsForField = (fieldValue: string) => {
    const field = fields.find(f => f.value === fieldValue);
    
    if (field?.type === 'number') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
      ];
    }
    
    if (field?.type === 'select' || field?.type === 'multi-select') {
      return [
        { value: 'equals', label: 'Is' },
        { value: 'not_equals', label: 'Is Not' },
        { value: 'in', label: 'In' },
        { value: 'not_in', label: 'Not In' },
      ];
    }
    
    return [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' },
      { value: 'starts_with', label: 'Starts With' },
      { value: 'ends_with', label: 'Ends With' },
    ];
  };

  const addGroup = () => {
    const newGroup: GenericSearchGroup = {
      id: `group-${Date.now()}`,
      conditions: [
        {
          id: `cond-${Date.now()}`,
          field: fields[0]?.value || 'name',
          operator: 'contains',
          value: '',
        },
      ],
      logicalOperator: 'AND',
    };
    setGroups([...groups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    if (groups.length > 1) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
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
              field: fields[0]?.value || 'name',
              operator: 'contains',
              value: '',
            },
          ],
        };
      }
      return group;
    }));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId && group.conditions.length > 1) {
        return {
          ...group,
          conditions: group.conditions.filter(c => c.id !== conditionId),
        };
      }
      return group;
    }));
  };

  const updateCondition = (
    groupId: string, 
    conditionId: string, 
    updates: Partial<GenericSearchCondition>
  ) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.map(condition => {
            if (condition.id === conditionId) {
              return { ...condition, ...updates };
            }
            return condition;
          }),
        };
      }
      return group;
    }));
  };

  const updateGroupOperator = (groupId: string, operator: 'AND' | 'OR') => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return { ...group, logicalOperator: operator };
      }
      return group;
    }));
  };

  const handleSearch = () => {
    onSearch(groups, globalOperator);
  };

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this search.",
        variant: "destructive",
      });
      return;
    }

    // Convert generic groups to saved search format (cast as any for now)
    const savedSearch = createSavedSearch(
      searchName,
      groups as any,
      globalOperator,
      searchDescription
    );

    toast({
      title: "Search saved",
      description: `"${searchName}" has been saved to your searches.`,
    });

    setShowSaveDialog(false);
    setSearchName('');
    setSearchDescription('');
    onSave?.(savedSearch.id);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Advanced Search Builder</CardTitle>
            <CardDescription>
              Create complex search queries with multiple conditions
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Operator */}
        <div className="flex items-center gap-2">
          <Label>Match</Label>
          <Select value={globalOperator} onValueChange={(v) => setGlobalOperator(v as 'AND' | 'OR')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">All groups</SelectItem>
              <SelectItem value="OR">Any group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Groups */}
        <div className="space-y-4">
          {groups.map((group, groupIndex) => (
            <Card key={group.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Group {groupIndex + 1}</Badge>
                    <Select 
                      value={group.logicalOperator} 
                      onValueChange={(v) => updateGroupOperator(group.id, v as 'AND' | 'OR')}
                    >
                      <SelectTrigger className="w-[100px] h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {groups.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(group.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.conditions.map((condition) => {
                  const field = fields.find(f => f.value === condition.field);
                  const operators = getOperatorsForField(condition.field);

                  return (
                    <div key={condition.id} className="flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs">Field</Label>
                        <Select
                          value={condition.field}
                          onValueChange={(v) => updateCondition(group.id, condition.id, { field: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fields.map(f => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1 space-y-2">
                        <Label className="text-xs">Operator</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(v) => updateCondition(group.id, condition.id, { operator: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(op => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1 space-y-2">
                        <Label className="text-xs">Value</Label>
                        {field?.type === 'select' || field?.type === 'multi-select' ? (
                          <Select
                            value={condition.value as string}
                            onValueChange={(v) => updateCondition(group.id, condition.id, { value: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map(opt => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field?.type === 'number' ? 'number' : 'text'}
                            value={condition.value as string}
                            onChange={(e) => updateCondition(group.id, condition.id, { 
                              value: field?.type === 'number' ? Number(e.target.value) : e.target.value 
                            })}
                            placeholder="Enter value..."
                          />
                        )}
                      </div>

                      {group.conditions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCondition(group.id, condition.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCondition(group.id)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Condition
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="outline" onClick={addGroup} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Group
        </Button>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSaveDialog(!showSaveDialog)}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <Card className="border-2 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-base">Save This Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Name</Label>
                <Input
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="e.g., Senior Developers in SF"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input
                  value={searchDescription}
                  onChange={(e) => setSearchDescription(e.target.value)}
                  placeholder="Brief description..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveSearch} className="flex-1">
                  Save Search
                </Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
