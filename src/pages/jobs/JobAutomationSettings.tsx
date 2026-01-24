import { useState } from "react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Switch } from "@/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Plus,
  Zap,
  Calendar,
  Clock,
  Bell,
  Trash2,
  Edit,
  Play,
  Pause,
  Activity
} from "lucide-react";
import {
  getAutomationRules,
  toggleAutomationRule,
  deleteAutomationRule,
  getScheduledJobs,
  cancelScheduledJob,
  AutomationRule,
  ScheduledJob,
} from "@/shared/lib/jobAutomationService";
import { useToast } from "@/shared/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { CreateAutomationDialog } from "@/components/jobs/automation/CreateAutomationDialog";
import { ScheduleJobDialog } from "@/components/jobs/automation/ScheduleJobDialog";

export default function JobAutomationSettings() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const rules = getAutomationRules();
  const scheduled = getScheduledJobs();

  const activeRules = rules.filter((r) => r.isActive);
  const inactiveRules = rules.filter((r) => !r.isActive);

  const handleToggleRule = (rule: AutomationRule) => {
    toggleAutomationRule(rule.id);
    toast({
      title: rule.isActive ? "Rule deactivated" : "Rule activated",
      description: `"${rule.name}" has been ${rule.isActive ? "deactivated" : "activated"}.`,
    });
  };

  const handleDeleteRule = (rule: AutomationRule) => {
    if (confirm(`Delete automation rule "${rule.name}"?`)) {
      deleteAutomationRule(rule.id);
      toast({
        title: "Rule deleted",
        description: `"${rule.name}" has been removed.`,
      });
    }
  };

  const handleCancelScheduled = (scheduled: ScheduledJob) => {
    if (confirm("Cancel this scheduled action?")) {
      cancelScheduledJob(scheduled.id);
      toast({
        title: "Scheduled action cancelled",
        description: "The scheduled action has been cancelled.",
      });
    }
  };

  const getTriggerText = (rule: AutomationRule): string => {
    switch (rule.trigger.type) {
      case "inactivity_days":
        return `After ${rule.trigger.days} days of inactivity`;
      case "applicant_count":
        return `When applicants reach ${rule.trigger.count}`;
      case "closing_soon":
        return `${rule.trigger.days} days before closing`;
      case "offer_accepted":
        return "When offer is accepted";
      default:
        return "Unknown trigger";
    }
  };

  const getActionText = (rule: AutomationRule): string => {
    switch (rule.action.type) {
      case "close_job":
        return "Close job";
      case "change_status":
        return `Change status to ${rule.action.status}`;
      case "notify":
        return `Notify ${rule.action.recipients.join(", ")}`;
      case "archive":
        return "Archive job";
      case "publish":
        return "Publish job";
      default:
        return "Unknown action";
    }
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Automation</h1>
            <p className="text-muted-foreground">
              Automate job workflows and streamline your recruitment process
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setScheduleDialogOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Action
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rules.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeRules.length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRules.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Actions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scheduled.filter((s) => s.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending execution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions This Month</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                Automated tasks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">
              <Zap className="h-4 w-4 mr-2" />
              Automation Rules
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled Actions
            </TabsTrigger>
            <TabsTrigger value="history">
              <Activity className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <div className="space-y-3">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base font-semibold">{rule.name}</CardTitle>
                          <Badge variant={rule.isActive ? "teal" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription className="mt-2">
                          <span className="font-medium">When:</span> {getTriggerText(rule)}
                          {" • "}
                          <span className="font-medium">Then:</span> {getActionText(rule)}
                        </CardDescription>
                      </div>
                      <div className="text-base font-semibold flex items-center gap-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => handleToggleRule(rule)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRule(rule)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {formatDistanceToNow(rule.createdAt, { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {rules.length === 0 && (
                <div className="text-center py-12 border rounded-lg">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No automation rules yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first automation rule to streamline your workflow
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <div className="space-y-3">
              {scheduled.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="text-base font-semibold flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold capitalize">{item.action}</h4>
                          <Badge
                            variant={
                              item.status === "pending"
                                ? "orange"
                                : item.status === "completed"
                                ? "teal"
                                : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(item.scheduledDate, "MMM dd, yyyy 'at' hh:mm a")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(item.scheduledDate, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      {item.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelScheduled(item)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {scheduled.length === 0 && (
                <div className="text-center py-12 border rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No scheduled actions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule future actions for your job postings
                  </p>
                  <Button onClick={() => setScheduleDialogOpen(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Action
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Automation History</CardTitle>
                <CardDescription>
                  View past automated actions and their outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Automation history will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CreateAutomationDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        <ScheduleJobDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
        />
      </div>
    </DashboardPageLayout>
  );
}
