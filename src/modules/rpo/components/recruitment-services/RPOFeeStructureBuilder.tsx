import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, Trash2, Copy } from "lucide-react";
import { RPOFeeStructure } from "@/types/recruitmentService";

interface RPOFeeStructureBuilderProps {
  fees: RPOFeeStructure[];
  onChange: (fees: RPOFeeStructure[]) => void;
}

const FEE_TEMPLATES = [
  {
    name: "Consultant Monthly Retainer",
    type: "consultant-monthly" as const,
    amount: 5990,
    frequency: "monthly" as const,
    description: "Monthly fee per dedicated consultant (guide price: $5,990)"
  },
  {
    name: "Per Vacancy Fee",
    type: "per-vacancy" as const,
    amount: 3990,
    frequency: "per-vacancy" as const,
    description: "Fee per vacancy filled (guide price: $3,990)"
  },
  {
    name: "Quarterly Performance Bonus",
    type: "milestone" as const,
    amount: 5000,
    frequency: "quarterly" as const,
    description: "Performance-based bonus paid quarterly"
  },
  {
    name: "Setup Fee (One-time)",
    type: "one-time" as const,
    amount: 5000,
    frequency: "one-time" as const,
    description: "Initial setup and onboarding fee"
  }
];

export function RPOFeeStructureBuilder({ fees, onChange }: RPOFeeStructureBuilderProps) {
  const [expandedFeeId, setExpandedFeeId] = useState<string | null>(null);

  const addFee = (template?: typeof FEE_TEMPLATES[0]) => {
    const newFee: RPOFeeStructure = template ? {
      id: `fee_${Date.now()}`,
      ...template
    } : {
      id: `fee_${Date.now()}`,
      type: 'consultant-monthly',
      name: '',
      amount: 0,
      frequency: 'monthly',
      description: ''
    };
    onChange([...fees, newFee]);
    setExpandedFeeId(newFee.id);
  };

  const updateFee = (id: string, updates: Partial<RPOFeeStructure>) => {
    onChange(fees.map(fee => fee.id === id ? { ...fee, ...updates } : fee));
  };

  const removeFee = (id: string) => {
    onChange(fees.filter(fee => fee.id !== id));
  };

  const duplicateFee = (fee: RPOFeeStructure) => {
    const newFee: RPOFeeStructure = {
      ...fee,
      id: `fee_${Date.now()}`,
      name: `${fee.name} (Copy)`
    };
    onChange([...fees, newFee]);
    setExpandedFeeId(newFee.id);
  };

  const totalMonthly = fees
    .filter(f => f.frequency === 'monthly')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalOneTime = fees
    .filter(f => f.frequency === 'one-time')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">Fee Structures</Label>
          <p className="text-sm text-muted-foreground">Define all fees for this RPO engagement</p>
        </div>
        <Select onValueChange={(value) => {
          if (value === "custom") {
            addFee();
          } else {
            const template = FEE_TEMPLATES[parseInt(value)];
            addFee(template);
          }
        }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Add from template" />
          </SelectTrigger>
          <SelectContent>
            {FEE_TEMPLATES.map((template, index) => (
              <SelectItem key={index} value={index.toString()}>
                {template.name}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom Fee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {fees.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">No fee structures added yet</p>
            <Button onClick={() => addFee()} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Fee
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {fees.map((fee, index) => (
            <Card key={fee.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="secondary">{fee.type}</Badge>
                    <CardTitle className="text-base">
                      {fee.name || `Fee #${index + 1}`}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">${fee.amount.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => duplicateFee(fee)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFee(fee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`fee-name-${fee.id}`}>Fee Name *</Label>
                    <Input
                      id={`fee-name-${fee.id}`}
                      value={fee.name}
                      onChange={(e) => updateFee(fee.id, { name: e.target.value })}
                      placeholder="e.g., Monthly Retainer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`fee-amount-${fee.id}`}>Amount ($) *</Label>
                    <Input
                      id={`fee-amount-${fee.id}`}
                      type="number"
                      value={fee.amount}
                      onChange={(e) => updateFee(fee.id, { amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`fee-type-${fee.id}`}>Fee Type *</Label>
                    <Select
                      value={fee.type}
                      onValueChange={(value: RPOFeeStructure['type']) => updateFee(fee.id, { type: value })}
                    >
                      <SelectTrigger id={`fee-type-${fee.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultant-monthly">Consultant Monthly</SelectItem>
                        <SelectItem value="per-vacancy">Per Vacancy</SelectItem>
                        <SelectItem value="milestone">Milestone Payment</SelectItem>
                        <SelectItem value="one-time">One-Time Fee</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`fee-frequency-${fee.id}`}>Frequency *</Label>
                    <Select
                      value={fee.frequency}
                      onValueChange={(value: RPOFeeStructure['frequency']) => updateFee(fee.id, { frequency: value })}
                    >
                      <SelectTrigger id={`fee-frequency-${fee.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="per-placement">Per Placement</SelectItem>
                        <SelectItem value="per-vacancy">Per Vacancy</SelectItem>
                        <SelectItem value="one-time">One-Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`fee-description-${fee.id}`}>Description</Label>
                  <Textarea
                    id={`fee-description-${fee.id}`}
                    value={fee.description}
                    onChange={(e) => updateFee(fee.id, { description: e.target.value })}
                    placeholder="Brief description of this fee"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {fees.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Monthly Fees</span>
                <span className="font-medium">${totalMonthly.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total One-Time Fees</span>
                <span className="font-medium">${totalOneTime.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Total Fees Defined</span>
                <span className="font-bold">{fees.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}