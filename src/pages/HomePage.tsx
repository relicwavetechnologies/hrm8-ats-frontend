import { useQuery } from "@tanstack/react-query";
import { DashboardSkeleton } from "@/shared/components/skeletons/DashboardSkeleton";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Users, Briefcase, DollarSign, Wallet, CreditCard, Building2, FileText, TrendingUp
} from "lucide-react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { EnhancedStatCard } from "@/modules/dashboard/components/EnhancedStatCard";
import { SubscriptionStatusCard } from "@/modules/dashboard/components/SubscriptionStatusCard";
import { TransactionHistoryCard } from "@/modules/wallet/components/TransactionHistoryCard";
import { companyService } from "@/shared/services/companyService";
import { walletService } from "@/shared/services/walletService";
import { useAuth } from "@/app/providers/AuthContext";
import { useToast } from "@/shared/hooks/use-toast";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: dashboardData, isLoading: loading } = useQuery({
    queryKey: ['dashboard', 'home', user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) return null;
      const [statsResult, balanceResult, subsResult, activeSubResult] = await Promise.allSettled([
        companyService.getCompanyStats(user.companyId),
        walletService.getBalance(),
        walletService.getSubscriptions(),
        fetch(`/api/companies/${user.companyId}/subscription/active`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.ok ? res.json() : { success: false, data: null })
      ]);
      return {
        companyStats: statsResult.status === 'fulfilled' ? statsResult.value : null,
        walletBalance: balanceResult.status === 'fulfilled' ? balanceResult.value : { balance: 0, totalCredits: 0, totalDebits: 0, status: 'ACTIVE' },
        subscriptions: (subsResult.status === 'fulfilled' && Array.isArray(subsResult.value)) ? subsResult.value : [],
        activeSubscription: (activeSubResult.status === 'fulfilled' && activeSubResult.value) ? (activeSubResult.value as { data?: unknown })?.data ?? null : null,
      };
    },
    enabled: !!user?.companyId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const companyStats = dashboardData?.companyStats ?? null;
  const walletBalance = dashboardData?.walletBalance ?? { balance: 0, totalCredits: 0, totalDebits: 0, status: 'ACTIVE' };
  const subscriptions = dashboardData?.subscriptions ?? [];
  const activeSubscription = dashboardData?.activeSubscription ?? null;

  if (loading) {
    return (
      <DashboardPageLayout>
        <DashboardSkeleton />
      </DashboardPageLayout>
    );
  }

  const activeSubscriptions = Array.isArray(subscriptions)
    ? subscriptions.filter(s => s.status === 'ACTIVE').length
    : 0;

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Home - Company Dashboard</title>
      </Helmet>

      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
            <p className="text-muted-foreground">Manage your jobs, employees, and wallet</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/subscriptions')}>
              <CreditCard className="h-4 w-4 mr-2" />
              Wallet
            </Button>
            <Button onClick={() => navigate('/admin-settings')}>
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <EnhancedStatCard
            title="Company Employees"
            value={companyStats?.employeeCount?.toString() || "0"}
            change="Active on platform"
            trend="up"
            icon={<Users className="h-3.5 w-3.5" />}
            variant="neutral"
            size="default"
            elevation="sm"
          />
          <EnhancedStatCard
            title="Wallet Balance"
            value={walletBalance?.balance?.toString() || "0"}
            change="Available balance"
            trend="up"
            icon={<Wallet className="h-3.5 w-3.5" />}
            variant="neutral"
            size="default"
            elevation="sm"
            isCurrency={true}
            rawValue={walletBalance?.balance || 0}
          />
          <EnhancedStatCard
            title="Active Subscriptions"
            value={activeSubscriptions.toString()}
            change="Active plans"
            trend="up"
            icon={<DollarSign className="h-3.5 w-3.5" />}
            variant="neutral"
            size="default"
            elevation="sm"
          />
          <EnhancedStatCard
            title="Jobs Posted"
            value={companyStats?.jobsPostedThisMonth?.toString() || "0"}
            change="This month"
            trend="up"
            icon={<Briefcase className="h-3.5 w-3.5" />}
            variant="neutral"
            size="default"
            elevation="sm"
          />
        </div>

        {/* Wallet & Subscription Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Subscription Status Card */}
          <SubscriptionStatusCard
            data={activeSubscription}
            loading={loading}
          />

          {/* Wallet Recharge Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Pay-As-You-Go Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">One-time wallet credits</p>
                <p className="text-2xl font-bold mt-2">${walletBalance?.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Recharge your wallet for flexible, on-demand usage
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/subscriptions')}>
                <CreditCard className="h-4 w-4 mr-2" />
                Recharge Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/jobs')}>
                <Briefcase className="h-6 w-6 mb-2" />
                <span className="text-xs">Jobs</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/employees')}>
                <Users className="h-6 w-6 mb-2" />
                <span className="text-xs">Employees</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/subscription')}>
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-xs">Subscriptions</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/company-profile')}>
                <Building2 className="h-6 w-6 mb-2" />
                <span className="text-xs">Profile</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/applications')}>
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-xs">Applications</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/analytics')}>
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-xs">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="text-base font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Active Jobs
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyStats?.activeJobs || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently open positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Applications
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyStats?.applicationsThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Received this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History Section */}
        <div className="mt-6">
          <TransactionHistoryCard />
        </div>
      </div>
    </DashboardPageLayout>
  );
}
