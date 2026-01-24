import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { useRBAC } from "@/shared/hooks/useRBAC";
import { getESSProfile, getESSStats, getQuickActions } from "@/shared/lib/essStorage";
import type { LucideIcon } from "lucide-react";
import { User, FileText, Calendar, Receipt, Heart, Clock, TrendingUp, Bell, CheckCircle2, AlertCircle, Edit } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ProfileEditDialog } from "@/modules/employees/components/ess/ProfileEditDialog";

export default function EmployeeSelfService() {
  const { userId } = useRBAC();
  const navigate = useNavigate();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const profile = getESSProfile(userId);
  const stats = getESSStats(userId);
  const quickActions = getQuickActions(userId);

  const getActionIcon = (iconName: string) => {
    const icons: Record<string, LucideIcon> = {
      Calendar,
      Receipt,
      FileText,
      User,
      Heart,
      Clock,
    };
    return icons[iconName] || User;
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Employee Self-Service</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {profile?.personalInfo.firstName}! Manage your information and requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Leave Balance</p>
                  <p className="text-xl font-bold">{stats.leaveBalance} days</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-xl font-bold">{stats.pendingApprovals}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Upcoming Reviews</p>
                  <p className="text-xl font-bold">{stats.upcomingReviews}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Unread Documents</p>
                  <p className="text-xl font-bold">{stats.unreadDocuments}</p>
                </div>
                <Bell className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Attendance</p>
                  <p className="text-xl font-bold">{stats.attendancePercentage}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
            </Card>
        </div>

        {/* Personal Information & Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Your basic details</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setProfileDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {profile?.personalInfo.firstName} {profile?.personalInfo.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{profile?.personalInfo.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.contactInfo.email}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile?.contactInfo.phone}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/ess/profile')}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Documents
              </CardTitle>
              <CardDescription>Latest payslips and documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Payslip - November 2024</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Generated 2 days ago</p>
                  </div>
                </div>
                <Badge>New</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tax Form - 2024</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Generated 1 week ago</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/ess/documents')}>
                View All Documents
              </Button>
            </CardContent>
          </Card>
        </div>

        <ProfileEditDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          employeeId={userId}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
    </DashboardPageLayout>
  );
}
