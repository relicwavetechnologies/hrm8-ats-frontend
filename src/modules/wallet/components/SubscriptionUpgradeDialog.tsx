/**
 * Subscription Upgrade Dialog
 * Dialog for upgrading/purchasing subscription plans with wallet credit
 * Uses dynamic pricing from API only
 */

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { walletService } from "@/shared/services/walletService";
import { pricingService } from "@/shared/lib/pricingService";
import { useToast } from "@/shared/hooks/use-toast";
import { useStripeIntegration } from "@/shared/hooks/useStripeIntegration";
import { StripePromptDialog } from "@/modules/settings/components/integrations/StripePromptDialog";
import { cn } from "@/shared/lib/utils";

interface SubscriptionUpgradeDialogProps {
    open: boolean;
    onClose: () => void;
    currentPlan?: string;
}

/** Plan metadata (features, quota) - API provides price/currency */
const PLAN_METADATA: Record<string, { name: string; jobQuota: number | null; features: string[]; recommended: boolean }> = {
    FREE: { name: 'ATS Lite', jobQuota: 1, features: ['1 Active Job', 'Basic ATS', 'Email Support'], recommended: false },
    PAYG: { name: 'Pay As You Go', jobQuota: 1, features: ['1 Active Job', 'Pay per job'], recommended: false },
    SMALL: { name: 'Small Plan', jobQuota: 5, features: ['5 Jobs/month', 'Full ATS', 'AI Screening', 'Priority Support'], recommended: true },
    MEDIUM: { name: 'Medium Plan', jobQuota: 25, features: ['25 Jobs/month', 'Everything in Small', 'Advanced Analytics'], recommended: false },
    LARGE: { name: 'Large Plan', jobQuota: 50, features: ['50 Jobs/month', 'Everything in Medium', 'Custom Integrations'], recommended: false },
    ENTERPRISE: { name: 'Enterprise', jobQuota: null, features: ['Unlimited Jobs', 'Everything in Large', 'Custom SLA'], recommended: false },
    CUSTOM: { name: 'Custom Enterprise', jobQuota: null, features: ['Unlimited Jobs', 'Custom SLA', 'White-label'], recommended: false },
    RPO: { name: 'RPO', jobQuota: null, features: ['Volume hiring', 'Dedicated team'], recommended: false },
};

type PlanForDisplay = {
    id: string;
    planType: string;
    name: string;
    price: number;
    currency: string;
    billingCycle: 'MONTHLY';
    jobQuota: number | null;
    features: string[];
    recommended: boolean;
};

export function SubscriptionUpgradeDialog({
    open,
    onClose,
    currentPlan,
}: SubscriptionUpgradeDialogProps) {
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { showPrompt, setShowPrompt, redirectPath, checkStripeRequired } = useStripeIntegration();

    const { data: apiTiers, isLoading: tiersLoading } = useQuery({
        queryKey: ['pricing', 'subscription-tiers'],
        queryFn: () => pricingService.getSubscriptionTiers(),
        enabled: open,
    });

    const plans = useMemo((): PlanForDisplay[] => {
        if (apiTiers && apiTiers.length > 0) {
            return apiTiers.map((tier) => {
                const meta = PLAN_METADATA[tier.planType] ?? { name: tier.name, jobQuota: null, features: [], recommended: false };
                return {
                    id: tier.planType.toLowerCase(),
                    planType: tier.planType,
                    name: meta.name,
                    price: tier.price,
                    currency: tier.currency,
                    billingCycle: 'MONTHLY' as const,
                    jobQuota: meta.jobQuota,
                    features: meta.features,
                    recommended: meta.recommended,
                };
            });
        }
        return [];
    }, [apiTiers]);

    const upgradeMutation = useMutation({
        mutationFn: async (planId: string) => {
            const plan = plans.find(p => p.id === planId || p.planType.toLowerCase() === planId.toLowerCase());
            if (!plan) throw new Error('Pricing is currently unavailable for your account');

            const isFree = plan.price <= 0;

            if (isFree) {
                return walletService.createSubscription({
                    planType: plan.planType,
                    name: plan.name,
                    basePrice: 0,
                    billingCycle: plan.billingCycle,
                    jobQuota: plan.jobQuota ?? undefined,
                    autoRenew: true,
                });
            }

            // Paid plans: Stripe checkout (production-grade) – redirects to Stripe; webhook creates subscription
            await walletService.createSubscriptionCheckout({
                planType: plan.planType,
                name: plan.name,
                amount: plan.price,
                billingCycle: plan.billingCycle,
                jobQuota: plan.jobQuota ?? undefined,
            });
        },
        onSuccess: (data, planId) => {
            const plan = plans.find(p => p.id === planId || p.planType.toLowerCase() === planId.toLowerCase());
            const isFree = plan?.price <= 0;

            queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'subscription'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'subscription', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            if (isFree) {
                toast({
                    title: "Subscription Activated",
                    description: data?.message || "Your plan has been activated.",
                });
                onClose();
            }
        },
        onError: (error: any) => {
            if (error.response?.status === 402 || error.errorCode === 'STRIPE_NOT_CONNECTED') {
                return;
            }
            toast({
                title: "Upgrade Failed",
                description: error.message || "Failed to upgrade subscription.",
                variant: "destructive",
            });
        },
    });

    const handleSelectPlan = (planId: string) => {
        const plan = plans.find(p => p.id === planId || p.planType.toLowerCase() === planId.toLowerCase());
        if (!plan) return;

        setSelectedPlan(planId);
        upgradeMutation.mutate(planId);
    };

    const displayPlans = tiersLoading ? [] : plans;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
                    <DialogDescription>
                        Select a subscription plan to unlock ATS access and monthly job posting quota.
                    </DialogDescription>
                </DialogHeader>

                {!tiersLoading && displayPlans.length === 0 && (
                    <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                        Unable to load dynamic subscription pricing. Please contact HRM8 admin.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {displayPlans.map((plan) => {
                        const isCurrent = currentPlan?.toLowerCase() === plan.id;
                        const isDisabled = upgradeMutation.isPending;
                        return (
                            <Card
                                key={plan.id}
                                className={cn(
                                    "relative transition-all",
                                    plan.recommended && "border-primary shadow-lg",
                                    isCurrent && "border-green-500"
                                )}
                            >
                                {plan.recommended && (
                                    <Badge className="absolute -top-2 -right-2 bg-primary">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Recommended
                                    </Badge>
                                )}
                                {isCurrent && (
                                    <Badge className="absolute -top-2 -right-2 bg-green-600">
                                        Current Plan
                                    </Badge>
                                )}

                                <CardHeader>
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    <CardDescription>
                                        <span className="text-3xl font-bold text-foreground">
                                            {pricingService.formatPrice(plan.price, plan.currency)}
                                        </span>
                                        <span className="text-muted-foreground">/month</span>
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Job Quota */}
                                    <div className="p-3 rounded-lg bg-accent">
                                        <p className="text-sm text-muted-foreground">Job Postings</p>
                                        <p className="text-lg font-semibold">
                                            {plan.jobQuota === null ? 'Unlimited' : `${plan.jobQuota} per month`}
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Features:</p>
                                        <ul className="space-y-1">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        className="w-full"
                                        variant={plan.recommended ? "default" : "outline"}
                                        disabled={isCurrent || isDisabled}
                                        onClick={() => handleSelectPlan(plan.id)}
                                    >
                                        {upgradeMutation.isPending && selectedPlan === plan.id ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : isCurrent ? (
                                            'Current Plan'
                                        ) : plan.price === 0 ? (
                                            'Free Plan'
                                        ) : (
                                            'Select Plan'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    }) }
                </div>

                <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-muted-foreground">
                        <strong>How it works:</strong> Subscription controls job posting quota and perks.
                        Wallet is used only when you select HRM8 managed recruitment services.
                    </p>
                </div>
            </DialogContent>

            {/* Stripe Connection Prompt */}
            <StripePromptDialog
                open={showPrompt}
                onOpenChange={setShowPrompt}
                redirectPath={redirectPath}
            />
        </Dialog>
    );
}
