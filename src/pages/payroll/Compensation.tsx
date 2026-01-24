import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { DollarSign, TrendingUp, Award, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { SalaryReviews } from "@/modules/payroll/components/compensation/SalaryReviews";
import { SalaryBandsView } from "@/modules/payroll/components/compensation/SalaryBandsView";
import { BonusPlans } from "@/modules/payroll/components/compensation/BonusPlans";
import { EquityGrants } from "@/modules/payroll/components/compensation/EquityGrants";
import { getCompensationReviews, getSalaryBands, calculateCompensationStats } from "@/shared/lib/compensationStorage";

export default function Compensation() {
  const [activeTab, setActiveTab] = useState("reviews");

  const reviews = useMemo(() => getCompensationReviews(), []);
  const bands = useMemo(() => getSalaryBands(), []);
  const stats = useMemo(() => calculateCompensationStats(), []);

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Compensation & Benefits</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compensation & Benefits</h1>
            <p className="text-muted-foreground">Manage salaries, bonuses, and equity compensation</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats.totalCompensationBudget / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.budgetUtilization.toFixed(1)}% utilized
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Avg Increase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageIncrease.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">This year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedReviews} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                Salary Bands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bands.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Defined levels</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="reviews">
              <TrendingUp className="h-4 w-4 mr-2" />
              Salary Reviews
            </TabsTrigger>
            <TabsTrigger value="bands">
              <BarChart3 className="h-4 w-4 mr-2" />
              Salary Bands
            </TabsTrigger>
            <TabsTrigger value="bonuses">
              <Award className="h-4 w-4 mr-2" />
              Bonus Plans
            </TabsTrigger>
            <TabsTrigger value="equity">
              <DollarSign className="h-4 w-4 mr-2" />
              Equity Grants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <SalaryReviews />
          </TabsContent>

          <TabsContent value="bands">
            <SalaryBandsView />
          </TabsContent>

          <TabsContent value="bonuses">
            <BonusPlans />
          </TabsContent>

          <TabsContent value="equity">
            <EquityGrants />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
