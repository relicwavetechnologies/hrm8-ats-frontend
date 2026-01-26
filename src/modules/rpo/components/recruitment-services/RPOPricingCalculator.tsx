import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Slider } from "@/shared/components/ui/slider";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Info } from "lucide-react";
import { calculateRPOGuidePricing } from "@/shared/lib/subscriptionConfig";

interface RPOPricingCalculatorProps {
  onCalculate?: (result: {
    consultants: number;
    months: number;
    vacancies: number;
    monthlyRetainer: number;
    totalMonthlyFees: number;
    perVacancyFees: number;
    totalEstimated: number;
  }) => void;
}

export function RPOPricingCalculator({ onCalculate }: RPOPricingCalculatorProps) {
  const [consultants, setConsultants] = useState(1);
  const [months, setMonths] = useState(12);
  const [vacancies, setVacancies] = useState(10);

  const pricing = calculateRPOGuidePricing(consultants, months, vacancies);

  const handleChange = (newConsultants: number, newMonths: number, newVacancies: number) => {
    if (onCalculate) {
      const result = calculateRPOGuidePricing(newConsultants, newMonths, newVacancies);
      onCalculate({
        consultants: newConsultants,
        months: newMonths,
        vacancies: newVacancies,
        ...result
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>RPO Pricing Calculator</CardTitle>
            <CardDescription>
              Estimate your RPO investment using our guide pricing
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Guide Prices
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Number of Consultants</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={consultants}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setConsultants(val);
                  handleChange(val, months, vacancies);
                }}
                className="w-20 text-right"
              />
            </div>
            <Slider
              value={[consultants]}
              onValueChange={([val]) => {
                setConsultants(val);
                handleChange(val, months, vacancies);
              }}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Contract Duration (months)</Label>
              <Input
                type="number"
                min={6}
                max={60}
                value={months}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 6;
                  setMonths(val);
                  handleChange(consultants, val, vacancies);
                }}
                className="w-20 text-right"
              />
            </div>
            <Slider
              value={[months]}
              onValueChange={([val]) => {
                setMonths(val);
                handleChange(consultants, val, vacancies);
              }}
              min={6}
              max={60}
              step={6}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Estimated Vacancies</Label>
              <Input
                type="number"
                min={0}
                max={200}
                value={vacancies}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setVacancies(val);
                  handleChange(consultants, months, val);
                }}
                className="w-20 text-right"
              />
            </div>
            <Slider
              value={[vacancies]}
              onValueChange={([val]) => {
                setVacancies(val);
                handleChange(consultants, months, val);
              }}
              min={0}
              max={200}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Retainer</span>
              <span className="font-semibold">
                ${pricing.monthlyRetainer.toLocaleString()}/month
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Monthly Fees ({months} months)</span>
              <span className="font-semibold">${pricing.totalMonthlyFees.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Per-Vacancy Fees ({vacancies} vacancies)
              </span>
              <span className="font-semibold">${pricing.perVacancyFees.toLocaleString()}</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">Total Estimated</span>
            <span className="font-bold text-2xl text-primary">
              ${pricing.totalEstimated.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <p className="text-sm font-medium mb-2">Calculation Breakdown:</p>
          {pricing.breakdown.map((line, index) => (
            <p key={index} className="text-xs text-muted-foreground font-mono">
              {line}
            </p>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>These are guide prices.</strong> Actual pricing is tailored to your specific needs,
            hiring volume, and contract terms. Contact us for a custom quote.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
