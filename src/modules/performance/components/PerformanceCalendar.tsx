import { useState } from "react";
import { Calendar, Clock, Users, AlertCircle, Plus, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { toast } from "sonner";
import { getReviewSchedules, saveReviewSchedule, getReviewTemplates } from "@/shared/lib/performanceStorage";
import { ReviewSchedule, ReviewCycle } from "@/shared/types/performance";
import { format, addMonths, addDays, isBefore, isAfter } from "date-fns";

interface PerformanceCalendarProps {
  goals?: any[];
  reviews?: any[];
  feedback?: any[];
}

export function PerformanceCalendar({ goals, reviews, feedback }: PerformanceCalendarProps) {
  const [schedules, setSchedules] = useState<ReviewSchedule[]>(getReviewSchedules());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const templates = getReviewTemplates();

  const upcomingReviews = schedules
    .filter(s => s.isActive && isAfter(new Date(s.nextReviewDate), new Date()))
    .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());

  const overdueReviews = schedules
    .filter(s => s.isActive && isBefore(new Date(s.nextReviewDate), new Date()))
    .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());

  const handleCreateSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const cycle = formData.get("cycle") as ReviewCycle;
    const templateId = formData.get("templateId") as string;
    const nextReviewDate = formData.get("nextReviewDate") as string;
    const autoAssignToManager = formData.get("autoAssign") === "on";
    const template = templates.find(t => t.id === templateId);

    const newSchedule: ReviewSchedule = {
      id: `schedule-${Date.now()}`,
      name: `${template?.name} - ${getCycleLabel(cycle)}`,
      templateId,
      templateName: template?.name || "Performance Review",
      cycle,
      nextReviewDate,
      employeeIds: [], // Empty means all employees
      autoAssignToManager,
      sendReminders: true,
      reminderDaysBefore: 7,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveReviewSchedule(newSchedule);
    setSchedules(getReviewSchedules());
    setIsCreateOpen(false);
    toast.success("Review schedule created successfully");
  };

  const handleToggleSchedule = (scheduleId: string, isActive: boolean) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      const updated = { ...schedule, isActive };
      saveReviewSchedule(updated);
      setSchedules(getReviewSchedules());
      toast.success(`Schedule ${isActive ? 'activated' : 'deactivated'}`);
    }
  };

  const getCycleLabel = (cycle: ReviewCycle) => {
    const labels = {
      quarterly: "Quarterly",
      "semi-annual": "Semi-Annual",
      annual: "Annual",
      probation: "Probation"
    };
    return labels[cycle];
  };

  const getCycleBadgeVariant = (cycle: ReviewCycle) => {
    const variants = {
      quarterly: "default",
      "semi-annual": "secondary",
      annual: "outline",
      probation: "destructive"
    };
    return variants[cycle] as any;
  };

  const getDaysUntil = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Scheduling</h2>
          <p className="text-muted-foreground">Automate performance review cycles with reminders</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Review Schedule</DialogTitle>
              <DialogDescription>
                Set up automated performance review cycles with reminders
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cycle">Review Cycle</Label>
                <Select name="cycle" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly (Every 3 months)</SelectItem>
                    <SelectItem value="semi-annual">Semi-Annual (Every 6 months)</SelectItem>
                    <SelectItem value="annual">Annual (Once per year)</SelectItem>
                    <SelectItem value="probation">Probation Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateId">Review Template</Label>
                <Select name="templateId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select review template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextReviewDate">Next Review Date</Label>
                <Input
                  type="date"
                  name="nextReviewDate"
                  required
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="autoAssign">Auto-assign Reviews</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create reviews for employees
                  </p>
                </div>
                <Switch name="autoAssign" defaultChecked />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Schedule</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overdue Reviews Alert */}
      {overdueReviews.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Overdue Reviews</CardTitle>
            </div>
            <CardDescription>
              {overdueReviews.length} review schedule{overdueReviews.length > 1 ? 's are' : ' is'} past due
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueReviews.map(schedule => {
                const template = templates.find(t => t.id === schedule.templateId);
                const daysOverdue = Math.abs(getDaysUntil(schedule.nextReviewDate));
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-destructive" />
                      <div>
                        <p className="font-medium">{template?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.employeeIds.length > 0 ? `${schedule.employeeIds.length} employees` : "All Employees"} • {getCycleLabel(schedule.cycle)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
                      </Badge>
                      <Button size="sm" variant="outline">
                        Create Reviews
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Review Schedules</CardTitle>
          <CardDescription>
            Automated review cycles with reminder notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingReviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No upcoming reviews scheduled</p>
              <p className="text-sm mt-1">Create a schedule to automate your review process</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReviews.map(schedule => {
                const template = templates.find(t => t.id === schedule.templateId);
                const daysUntil = getDaysUntil(schedule.nextReviewDate);
                const isUrgent = daysUntil <= 7;
                
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${isUrgent ? 'bg-orange-500/10' : 'bg-primary/10'}`}>
                        <Calendar className={`h-5 w-5 ${isUrgent ? 'text-orange-500' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{template?.name}</p>
                          <Badge variant={getCycleBadgeVariant(schedule.cycle)}>
                            {getCycleLabel(schedule.cycle)}
                          </Badge>
                          {schedule.autoAssignToManager && (
                            <Badge variant="outline" className="text-xs">
                              Auto-assign
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(schedule.nextReviewDate), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {schedule.employeeIds.length > 0 ? `${schedule.employeeIds.length} employees` : "All Employees"}
                          </div>
                          {schedule.sendReminders && (
                            <div className="text-xs">
                              Reminder: {schedule.reminderDaysBefore} days before
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant={isUrgent ? "default" : "secondary"}>
                          {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                        </Badge>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToggleSchedule(schedule.id, !schedule.isActive)}
                        title={schedule.isActive ? "Deactivate" : "Activate"}
                      >
                        {schedule.isActive ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.filter(s => s.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              Automated review cycles running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingReviews.filter(s => getDaysUntil(s.nextReviewDate) <= 30).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Reviews scheduled soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueReviews.length}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
