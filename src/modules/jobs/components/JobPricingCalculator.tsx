import { useState, useEffect } from "react";
import { pricingService, type JobPriceCalculation } from "@/shared/lib/pricingService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Calculator, DollarSign } from "lucide-react";

interface JobPricingCalculatorProps {
  salaryMax?: number;
  onPriceCalculated?: (calculation: JobPriceCalculation) => void;
}

export function JobPricingCalculator({ 
  salaryMax: initialSalary,
  onPriceCalculated 
}: JobPricingCalculatorProps) {
  const [salaryMax, setSalaryMax] = useState<number>(initialSalary || 0);
  const [calculation, setCalculation] = useState<JobPriceCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSalary && initialSalary > 0) {
      calculatePrice(initialSalary);
    }
  }, [initialSalary]);

  const calculatePrice = async (salary: number) => {
    if (!salary || salary <= 0) {
      setCalculation(null);
      return;
    }

    try {
      setLoading(true);
      const result = await pricingService.calculateJobPrice(salary);
      setCalculation(result);
      
      if (onPriceCalculated) {
        onPriceCalculated(result);
      }
    } catch (err) {
      console.error("Failed to calculate price:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSalaryChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setSalaryMax(numValue);
    
    // Debounce calculation
    if (numValue > 0) {
      const timeout = setTimeout(() => {
        calculatePrice(numValue);
      }, 500);
      
      return () => clearTimeout(timeout);
    } else {
      setCalculation(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Job Pricing Calculator
        </CardTitle>
        <CardDescription>
          Calculate recruitment service price based on salary range
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="salary-max">Maximum Salary</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="salary-max"
              type="number"
              placeholder="Enter maximum salary"
              value={salaryMax || ""}
              onChange={(e) => handleSalaryChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">
            Calculating price...
          </div>
        )}

        {calculation && !loading && (
          <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Service Type:</span>
              <Badge variant={calculation.isExecutiveSearch ? "default" : "secondary"}>
                {calculation.isExecutiveSearch ? "Executive Search" : "Standard Recruitment"}
              </Badge>
            </div>
            
            {calculation.band && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Band:</span>
                <span className="text-sm">{calculation.band}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm font-medium">Price:</span>
              <span className="text-lg font-bold">
                {pricingService.formatPrice(calculation.price, calculation.currency)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
