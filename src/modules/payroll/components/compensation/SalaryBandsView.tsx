import { Plus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { getSalaryBands } from "@/shared/lib/compensationStorage";
import { format } from "date-fns";

export function SalaryBandsView() {
  const bands = getSalaryBands();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Salary bands define compensation ranges for different job levels
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Band
        </Button>
      </div>

      <div className="space-y-3">
        {bands.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Salary Bands</h3>
              <p className="text-muted-foreground mb-4">
                Create salary bands to define compensation ranges
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Band
              </Button>
            </CardContent>
          </Card>
        ) : (
          bands.map((band) => (
            <Card key={band.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{band.jobTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Level: {band.jobLevel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Effective</p>
                    <p className="text-sm font-medium">
                      {format(new Date(band.effectiveDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-xs text-muted-foreground">Minimum</p>
                    <p className="text-lg font-bold">
                      ${band.minSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-xs text-muted-foreground">Midpoint</p>
                    <p className="text-lg font-bold">
                      ${band.midSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-xs text-muted-foreground">Maximum</p>
                    <p className="text-lg font-bold">
                      ${band.maxSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Range Spread</span>
                    <span className="font-medium">
                      {(((band.maxSalary - band.minSalary) / band.minSalary) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={50}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${band.minSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    <span>${band.maxSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
