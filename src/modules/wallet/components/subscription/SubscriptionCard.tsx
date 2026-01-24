/**
 * Subscription Card Component
 * Displays current subscription information from company profile
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/lib/subscriptionConfig";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface SubscriptionCardProps {
  companyId: string | undefined;
  onUpgradeClick: () => void;
}

function getPackageDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    'ats-lite': 'ATS Lite (Free)',
    'payg': 'Pay As You Go',
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'enterprise': 'Enterprise',
  };
  return names[tier] || tier;
}

function isPaidPackage(tier: SubscriptionTier): boolean {
  return tier !== 'ats-lite';
}

export function SubscriptionCard({ companyId, onUpgradeClick }: SubscriptionCardProps) {
  const { data, isLoading } = useCompanyProfile();
  
  // Get subscription tier from company profile
  const subscriptionTier: SubscriptionTier = (() => {
    if (!data?.profile?.profileData) {
      return 'ats-lite';
    }
    
    const profileData = data.profile.profileData as any;
    const tier = profileData.billing?.subscriptionTier || profileData.subscriptionTier;
    
    // Validate tier exists in SUBSCRIPTION_TIERS
    if (tier && tier in SUBSCRIPTION_TIERS) {
      return tier as SubscriptionTier;
    }
    
    return 'ats-lite';
  })();

  const tierConfig = SUBSCRIPTION_TIERS[subscriptionTier];
  const isPaid = isPaidPackage(subscriptionTier);
  const displayName = getPackageDisplayName(subscriptionTier);

  if (!companyId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Company information not available
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
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
          <p className="text-2xl font-bold">{displayName}</p>
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
            {tierConfig.features.brandedCareersPage && (
              <li className="flex items-center gap-1">
                <Check className="h-3 w-3 text-primary" />
                Branded Careers Page
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

        {!isPaid && (
          <Button
            onClick={onUpgradeClick}
            className="w-full"
            variant="default"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}



