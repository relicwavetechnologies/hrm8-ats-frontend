import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Sparkles, Check } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";
import { createUpgradeCheckoutSession, type UpgradeTier } from "@/lib/payments";

interface PackageUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onUpgradeSuccess?: () => void;
}

export function PackageUpgradeDialog({
  open,
  onOpenChange,
  companyId,
  onUpgradeSuccess,
}: PackageUpgradeDialogProps) {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<UpgradeTier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const upgradePackages: Array<{
    id: UpgradeTier;
    name: string;
    price: number;
    description: string;
    features: string[];
  }> = useMemo(() => ([
    {
      id: "shortlisting",
      name: "Shortlisting",
      price: 1990,
      description: "We screen candidates and deliver a shortlist.",
      features: ["Job board advertising", "Applicant screening", "Shortlist delivered"],
    },
    {
      id: "full_service",
      name: "Full Service",
      price: 5990,
      description: "Complete recruitment with interview coordination and offers.",
      features: ["End-to-end support", "Interview coordination", "Offer negotiation"],
    },
    {
      id: "executive_search",
      name: "Executive Search",
      price: 9990,
      description: "Leadership roles with confidential search and assessment.",
      features: ["C-level positions", "Confidential search", "Executive assessment"],
    },
  ]), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTier) {
      setError("Please select a package.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createUpgradeCheckoutSession({
        tier: selectedTier,
        companyId,
      });

      if (!response.success || !response.data?.checkoutUrl) {
        throw new Error(response.error || "Failed to create checkout session.");
      }

      setSuccess(true);
      toast({
        title: "Redirecting to payment",
        description: "Secure checkout is opening in a new tab.",
      });

      window.location.href = response.data.checkoutUrl;
    } catch (err: any) {
      setError(err?.message || "Unexpected error during upgrade.");
      toast({
        title: "Upgrade error",
        description: err?.message || "Unexpected error during upgrade.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Upgrade Your Subscription
            </DialogTitle>
            <DialogDescription>
              Upgrade to unlock consultant services and advanced features
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Alert className="bg-primary/5 border-primary/40">
              <AlertTitle>Secure checkout</AlertTitle>
              <AlertDescription>
                Choose a package and you&apos;ll be redirected to Stripe Checkout to complete payment.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Upgrade error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertTitle className="text-emerald-700 dark:text-emerald-200">
                  Upgrade successful
                </AlertTitle>
                <AlertDescription className="text-emerald-700/90 dark:text-emerald-200/90">
                  Your subscription has been upgraded successfully.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label>Select Upgrade Package</Label>
              <RadioGroup value={selectedTier || ""} onValueChange={(value) => setSelectedTier(value as UpgradeTier)}>
                {upgradePackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                      selectedTier === pkg.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedTier(pkg.id)}
                  >
                    <RadioGroupItem value={pkg.id} id={pkg.id} />
                    <Label htmlFor={pkg.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{pkg.name}</p>
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${pkg.price.toLocaleString("en-US")}</p>
                          <p className="text-xs text-muted-foreground">one-time</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Selected Tier Details */}
            {selectedTier && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  {upgradePackages
                    .filter((pkg) => pkg.id === selectedTier)
                    .map((pkg) => (
                      <div key={pkg.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Selected Package:</span>
                          <span className="font-bold text-primary">{pkg.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <span className="font-semibold">${pkg.price.toLocaleString("en-US")}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs font-medium mb-1">Key Features:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {pkg.features.map((feature) => (
                              <li key={feature} className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || success || !selectedTier}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Redirecting..." : "Upgrade & Pay"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}











