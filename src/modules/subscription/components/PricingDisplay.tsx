import { useEffect, useState } from "react";
import { pricingService, type SubscriptionTier } from "@/shared/lib/pricingService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2 } from "lucide-react";

export function PricingDisplay() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [currency, setCurrency] = useState<string>("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tiersData, currencyData] = await Promise.all([
        pricingService.getSubscriptionTiers(),
        pricingService.getCompanyCurrency(),
      ]);
      
      setTiers(tiersData);
      setCurrency(currencyData.billingCurrency);
    } catch (err: any) {
      console.error("Failed to load pricing:", err);
      setError(err.message || "Failed to load pricing information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription Plans</h2>
        <Badge variant="outline">Currency: {currency}</Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.planType}>
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">
                  {pricingService.formatPrice(tier.price, tier.currency)}
                </span>
                <span className="text-muted-foreground"> / month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>{tier.planType}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
