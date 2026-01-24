import { useState, useMemo } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Gift, Users, DollarSign, TrendingUp, Plus, Download } from "lucide-react";
import { getBenefitPlans, getBenefitEnrollments, calculateBenefitsStats } from "@/shared/lib/benefitsStorage";
import { Badge } from "@/shared/components/ui/badge";
import { BenefitEnrollmentDialog } from "@/modules/benefits/components/BenefitEnrollmentDialog";

export default function Benefits() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [benefitDialogOpen, setBenefitDialogOpen] = useState(false);

  const plans = useMemo(() => getBenefitPlans(), [refreshKey]);
  const enrollments = useMemo(() => getBenefitEnrollments(), [refreshKey]);
  const stats = useMemo(() => calculateBenefitsStats(), [refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <DashboardPageLayout>
      <div className="space-y-6 p-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Benefits Administration</h1>
          <p className="text-muted-foreground">Manage employee benefits, enrollments, and providers</p>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Gift className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employee Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.employeeCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employer Cost</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.employerCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="plans" className="space-y-4">
          <div className="text-base font-semibold flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="plans">Benefit Plans</TabsTrigger>
              <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => setBenefitDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Enroll in Benefits
              </Button>
            </div>
          </div>

          <TabsContent value="plans" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map(plan => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.provider}</p>
                      </div>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{plan.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Employee Cost:</span>
                      <span className="font-medium">${plan.employeeCost}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Employer Cost:</span>
                      <span className="font-medium">${plan.employerCost}/mo</span>
                    </div>
                    <Badge variant="outline" className="capitalize">{plan.type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="enrollments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Benefit Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enrollments.map(enrollment => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{enrollment.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.benefitPlanName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-right">
                          <p className="text-muted-foreground">Coverage</p>
                          <p className="font-medium capitalize">{enrollment.coverageLevel.replace('-', ' + ')}</p>
                        </div>
                        <div className="text-sm text-right">
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-medium">${enrollment.employeeCost}/mo</p>
                        </div>
                        <Badge
                          variant={
                            enrollment.status === 'enrolled' ? 'default' :
                            enrollment.status === 'pending' ? 'secondary' :
                            'outline'
                          }
                        >
                          {enrollment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Benefit Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Manage benefit providers and contacts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Benefits Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Benefits analytics and cost reports</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <BenefitEnrollmentDialog 
          open={benefitDialogOpen} 
          onOpenChange={setBenefitDialogOpen}
          onSuccess={handleRefresh}
        />
      </div>
    </DashboardPageLayout>
  );
}
