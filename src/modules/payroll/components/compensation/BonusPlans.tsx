import { Plus, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { getBonusPlans } from "@/shared/lib/compensationStorage";

export function BonusPlans() {
  const plans = getBonusPlans();

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      performance: { variant: 'default', label: 'Performance' },
      annual: { variant: 'secondary', label: 'Annual' },
      signing: { variant: 'outline', label: 'Signing' },
      retention: { variant: 'default', label: 'Retention' },
      spot: { variant: 'secondary', label: 'Spot' },
    };
    return variants[type] || variants.annual;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage bonus programs and incentive plans
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bonus Plans</h3>
              <p className="text-muted-foreground mb-4">
                Create bonus plans to incentivize performance
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => {
            const typeBadge = getTypeBadge(plan.type);

            return (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                      {plan.isActive ? (
                        <Badge variant="outline">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">
                      ${plan.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fiscal Year: </span>
                      <span className="font-medium">{plan.fiscalYear}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payout Schedule: </span>
                      <span className="font-medium">{plan.payoutSchedule}</span>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Eligibility:</p>
                      <p className="text-sm">{plan.eligibilityCriteria}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
