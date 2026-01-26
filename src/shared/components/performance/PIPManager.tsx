import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Users,
  Target,
  MessageSquare,
  BookOpen,
  Bell,
  BellOff,
  FileText,
  Plus,
  Edit
} from "lucide-react";
import { PerformanceImprovementPlan, PIPMilestone, PIPCheckIn, PIPAlert } from "@/types/performance";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";

interface PIPManagerProps {
  pips: PerformanceImprovementPlan[];
  onUpdatePIP: (id: string, updates: Partial<PerformanceImprovementPlan>) => void;
  onCreateCheckIn: (pipId: string, checkIn: Partial<PIPCheckIn>) => void;
}

export function PIPManager({ pips, onUpdatePIP, onCreateCheckIn }: PIPManagerProps) {
  const [selectedPIP, setSelectedPIP] = useState<PerformanceImprovementPlan | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInRating, setCheckInRating] = useState<1 | 2 | 3 | 4 | 5>(3);

  const getStatusBadge = (status: PerformanceImprovementPlan['status']) => {
    const variants = {
      'active': { label: 'Active', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      'on-track': { label: 'On Track', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      'at-risk': { label: 'At Risk', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      'completed': { label: 'Completed', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
      'failed': { label: 'Failed', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      'cancelled': { label: 'Cancelled', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
    };
    return <Badge className={variants[status].className}>{variants[status].label}</Badge>;
  };

  const getSeverityBadge = (severity: PerformanceImprovementPlan['severity']) => {
    const variants = {
      'low': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return <Badge className={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getMilestoneIcon = (status: PIPMilestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const calculateProgress = (pip: PerformanceImprovementPlan) => {
    const completedMilestones = pip.milestones.filter(m => m.status === 'completed').length;
    return (completedMilestones / pip.milestones.length) * 100;
  };

  const getUnacknowledgedAlerts = (pip: PerformanceImprovementPlan) => {
    return pip.alerts.filter(a => !a.acknowledged);
  };

  const handleAcknowledgeAlert = (pipId: string, alertId: string) => {
    const pip = pips.find(p => p.id === pipId);
    if (!pip) return;

    const updatedAlerts = pip.alerts.map(alert =>
      alert.id === alertId
        ? {
            ...alert,
            acknowledged: true,
            acknowledgedBy: 'Current User',
            acknowledgedDate: new Date().toISOString()
          }
        : alert
    );

    onUpdatePIP(pipId, { alerts: updatedAlerts });
    toast.success("Alert acknowledged");
  };

  const handleSaveCheckIn = () => {
    if (!selectedPIP) return;

    const newCheckIn: Partial<PIPCheckIn> = {
      id: `c-${Date.now()}`,
      scheduledDate: new Date().toISOString(),
      completedDate: new Date().toISOString(),
      attendees: [
        { id: 'manager-1', name: 'Current Manager', role: 'Manager' },
        { id: selectedPIP.employeeId, name: selectedPIP.employeeName, role: 'Employee' }
      ],
      discussionPoints: ['Progress review', 'Challenges and support needs'],
      progressRating: checkInRating,
      managerNotes: checkInNotes,
      actionItems: []
    };

    onCreateCheckIn(selectedPIP.id, newCheckIn);
    setIsCheckInDialogOpen(false);
    setCheckInNotes('');
    setCheckInRating(3);
    toast.success("Check-in recorded");
  };

  const activePIPs = pips.filter(p => ['active', 'on-track', 'at-risk'].includes(p.status));
  const atRiskCount = pips.filter(p => p.status === 'at-risk').length;
  const totalAlerts = pips.reduce((sum, p) => sum + getUnacknowledgedAlerts(p).length, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Improvement Plans</h2>
          <p className="text-muted-foreground">Structured support for performance development</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active PIPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePIPs.length}</div>
            <p className="text-xs text-muted-foreground">currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground">requiring attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unacknowledged Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">pending acknowledgment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pips.filter(p => p.status === 'completed').length}/{pips.length}
            </div>
            <p className="text-xs text-muted-foreground">successfully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* PIPs List */}
      <div className="grid gap-4 md:grid-cols-2">
        {pips.map((pip) => {
          const progress = calculateProgress(pip);
          const unackAlerts = getUnacknowledgedAlerts(pip);
          const daysRemaining = Math.ceil(
            (new Date(pip.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Card 
              key={pip.id} 
              className={cn(
                "hover:shadow-lg transition-shadow cursor-pointer",
                pip.status === 'at-risk' && "border-red-300 dark:border-red-800"
              )}
              onClick={() => {
                setSelectedPIP(pip);
                setIsDetailDialogOpen(true);
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{pip.employeeName}</CardTitle>
                    <CardDescription>{pip.triggerReason.substring(0, 60)}...</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(pip.status)}
                    {getSeverityBadge(pip.severity)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{format(new Date(pip.startDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">{format(new Date(pip.endDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{daysRemaining} days remaining</span>
                  </div>
                  {unackAlerts.length > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      {unackAlerts.length} alerts
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* PIP Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          {selectedPIP && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedPIP.employeeName}</DialogTitle>
                    <DialogDescription className="mt-1">
                      Manager: {selectedPIP.managerName} • HR: {selectedPIP.hrPartnerName}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedPIP.status)}
                    {getSeverityBadge(selectedPIP.severity)}
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="milestones">
                    Milestones
                    <Badge variant="outline" className="ml-2">
                      {selectedPIP.milestones.filter(m => m.status === 'completed').length}/{selectedPIP.milestones.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="checkins">Check-ins</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="alerts">
                    Alerts
                    {getUnacknowledgedAlerts(selectedPIP).length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {getUnacknowledgedAlerts(selectedPIP).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Trigger Reason</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>{selectedPIP.triggerReason}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Performance Issues</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedPIP.performanceIssues.map((issue, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Expected Outcomes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedPIP.expectedOutcomes.map((outcome, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Consequences</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground italic">{selectedPIP.consequences}</p>
                        </CardContent>
                      </Card>

                      {selectedPIP.notes && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Manager Notes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{selectedPIP.notes}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {selectedPIP.milestones.map((milestone, idx) => (
                        <Card key={milestone.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {getMilestoneIcon(milestone.status)}
                                <div>
                                  <CardTitle className="text-base">{milestone.title}</CardTitle>
                                  <CardDescription>{milestone.description}</CardDescription>
                                </div>
                              </div>
                              <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'}>
                                {milestone.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Target Date</p>
                                <p className="font-medium">{format(new Date(milestone.targetDate), 'MMM d, yyyy')}</p>
                              </div>
                              {milestone.completedDate && (
                                <div>
                                  <p className="text-muted-foreground">Completed Date</p>
                                  <p className="font-medium">{format(new Date(milestone.completedDate), 'MMM d, yyyy')}</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Success Criteria:</p>
                              <ul className="text-sm space-y-1">
                                {milestone.successCriteria.map((criteria, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-muted-foreground">•</span>
                                    <span>{criteria}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {milestone.actualResults && (
                              <div className="pt-3 border-t">
                                <p className="text-sm font-medium mb-1">Actual Results:</p>
                                <p className="text-sm text-muted-foreground">{milestone.actualResults}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="checkins" className="space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={() => setIsCheckInDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Check-in
                    </Button>
                  </div>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {selectedPIP.checkIns.map((checkIn) => (
                        <Card key={checkIn.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">
                                  {format(new Date(checkIn.scheduledDate), 'MMMM d, yyyy')}
                                </CardTitle>
                                <CardDescription>
                                  Attendees: {checkIn.attendees.map(a => a.name).join(', ')}
                                </CardDescription>
                              </div>
                              {checkIn.completedDate ? (
                                <Badge variant="default">Completed</Badge>
                              ) : (
                                <Badge variant="outline">Scheduled</Badge>
                              )}
                            </div>
                          </CardHeader>
                          {checkIn.completedDate && (
                            <CardContent className="space-y-4">
                              <div>
                                <p className="text-sm font-medium mb-2">Progress Rating:</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={checkIn.progressRating * 20} className="flex-1" />
                                  <span className="text-sm font-bold">{checkIn.progressRating}/5</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Manager Notes:</p>
                                <p className="text-sm text-muted-foreground">{checkIn.managerNotes}</p>
                              </div>
                              {checkIn.employeeNotes && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Employee Notes:</p>
                                  <p className="text-sm text-muted-foreground">{checkIn.employeeNotes}</p>
                                </div>
                              )}
                              {checkIn.positives && checkIn.positives.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    Positives:
                                  </p>
                                  <ul className="text-sm space-y-1">
                                    {checkIn.positives.map((positive, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-green-600 mt-1" />
                                        <span>{positive}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {checkIn.concerns && checkIn.concerns.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-amber-600" />
                                    Concerns:
                                  </p>
                                  <ul className="text-sm space-y-1">
                                    {checkIn.concerns.map((concern, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <AlertTriangle className="h-3 w-3 text-amber-600 mt-1" />
                                        <span>{concern}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {selectedPIP.resources.map((resource) => (
                        <Card key={resource.id}>
                          <CardContent className="flex items-start justify-between py-4">
                            <div className="flex items-start gap-3">
                              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">{resource.title}</p>
                                <p className="text-sm text-muted-foreground">{resource.description}</p>
                                {resource.provider && (
                                  <p className="text-xs text-muted-foreground mt-1">Provider: {resource.provider}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={resource.status === 'completed' ? 'default' : 'outline'}>
                                {resource.status}
                              </Badge>
                              <Badge variant="secondary">{resource.type}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {selectedPIP.alerts.map((alert) => (
                        <Card 
                          key={alert.id}
                          className={cn(
                            alert.severity === 'critical' && !alert.acknowledged && "border-red-300 dark:border-red-800"
                          )}
                        >
                          <CardContent className="flex items-start justify-between py-4">
                            <div className="flex items-start gap-3 flex-1">
                              {alert.acknowledged ? (
                                <BellOff className="h-5 w-5 text-muted-foreground mt-0.5" />
                              ) : (
                                <Bell className={cn(
                                  "h-5 w-5 mt-0.5",
                                  alert.severity === 'critical' ? "text-red-600" : 
                                  alert.severity === 'warning' ? "text-amber-600" : 
                                  "text-blue-600"
                                )} />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={
                                    alert.severity === 'critical' ? 'destructive' :
                                    alert.severity === 'warning' ? 'default' :
                                    'secondary'
                                  }>
                                    {alert.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(alert.date), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <p className="text-sm">{alert.message}</p>
                                {alert.acknowledged && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Acknowledged by {alert.acknowledgedBy} on{' '}
                                    {format(new Date(alert.acknowledgedDate!), 'MMM d, yyyy')}
                                  </p>
                                )}
                              </div>
                            </div>
                            {!alert.acknowledged && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAcknowledgeAlert(selectedPIP.id, alert.id)}
                              >
                                Acknowledge
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Check-in</DialogTitle>
            <DialogDescription>Document progress and provide feedback</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Progress Rating (1-5)</Label>
              <Select 
                value={checkInRating.toString()} 
                onValueChange={(v) => setCheckInRating(Number(v) as 1 | 2 | 3 | 4 | 5)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - No Progress</SelectItem>
                  <SelectItem value="2">2 - Minimal Progress</SelectItem>
                  <SelectItem value="3">3 - Some Progress</SelectItem>
                  <SelectItem value="4">4 - Good Progress</SelectItem>
                  <SelectItem value="5">5 - Excellent Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Manager Notes</Label>
              <Textarea
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                placeholder="Document discussion points, progress observations, and feedback..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCheckIn}>Save Check-in</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
