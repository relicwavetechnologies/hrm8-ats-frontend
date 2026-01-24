import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Sparkles, Check } from "lucide-react";
import { getPackageTier, getPackageDisplayName, isPaidPackage } from "@/lib/packageUtils";
import { SUBSCRIPTION_TIERS } from "@/lib/subscriptionConfig";
import { PackageUpgradeDialog } from "./PackageUpgradeDialog";
import { useState } from "react";

interface CurrentPackageCardProps {
  companyId: string;
  showUpgradeButton?: boolean;
}

export function CurrentPackageCard({ companyId, showUpgradeButton = true }: CurrentPackageCardProps) {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  
  const packageTier = getPackageTier(companyId);
  const isPaid = isPaidPackage(companyId);
  const tierConfig = SUBSCRIPTION_TIERS[packageTier];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Subscription</CardTitle>
              <CardDescription>Your current package and features</CardDescription>
            </div>
            <Badge variant={isPaid ? "default" : "secondary"}>
              {isPaid ? "Paid" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-2xl font-bold">{getPackageDisplayName(packageTier)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tierConfig.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Max Open Jobs</p>
              <p className="text-lg font-semibold">
                {tierConfig.maxOpenJobs === 9999 ? "Unlimited" : tierConfig.maxOpenJobs}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Price</p>
              <p className="text-lg font-semibold">
                ${tierConfig.monthlyPrice}
                <span className="text-xs text-muted-foreground font-normal">/month</span>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-2">Key Features:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {tierConfig.features.coreATS && (
                <li className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-primary" />
                  Core ATS Features
                </li>
              )}
              {tierConfig.features.aiScreening && (
                <li className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-primary" />
                  AI Screening & Matching
                </li>
              )}
              {tierConfig.features.teamCollaboration && (
                <li className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-primary" />
                  Team Collaboration
                </li>
              )}
              {isPaid && (
                <li className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-primary" />
                  Consultant Services Access
                </li>
              )}
            </ul>
          </div>

          {showUpgradeButton && !isPaid && (
            <Button
              onClick={() => setUpgradeDialogOpen(true)}
              className="w-full"
              variant="default"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade Package
            </Button>
          )}
        </CardContent>
      </Card>

      <PackageUpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        companyId={companyId}
        onUpgradeSuccess={() => {
          window.location.reload();
        }}
      />
    </>
  );
}











