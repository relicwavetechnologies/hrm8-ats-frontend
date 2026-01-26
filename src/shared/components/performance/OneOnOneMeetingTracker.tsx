import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle2, Circle, AlertCircle, ChevronRight, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { OneOnOneMeeting, MeetingAgendaTemplate, MeetingActionItem } from "@/types/performance";

interface OneOnOneMeetingTrackerProps {
  meetings: OneOnOneMeeting[];
  templates: MeetingAgendaTemplate[];
  onScheduleMeeting?: (meeting: OneOnOneMeeting) => void;
  onUpdateMeeting?: (meeting: OneOnOneMeeting) => void;
  onUpdateActionItem?: (meetingId: string, actionItem: MeetingActionItem) => void;
}

export function OneOnOneMeetingTracker({
  meetings,
  templates,
  onScheduleMeeting,
  onUpdateMeeting,
  onUpdateActionItem,
}: OneOnOneMeetingTrackerProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<OneOnOneMeeting | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isActionItemDialogOpen, setIsActionItemDialogOpen] = useState(false);

  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled').sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  const pastMeetings = meetings.filter(m => m.status === 'completed').sort((a, b) => 
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );

  const allActionItems = meetings.flatMap(m => 
    m.actionItems.map(item => ({ ...item, meetingId: m.id, meetingDate: m.scheduledDate }))
  ).filter(item => item.status !== 'completed');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      scheduled: "default",
      completed: "secondary",
      cancelled: "outline",
      rescheduled: "outline"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getActionItemStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Circle className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      high: "destructive",
      medium: "default",
      low: "secondary"
    };
    return <Badge variant={variants[priority] as any}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">1-on-1 Meetings</h2>
          <p className="text-muted-foreground">Track your one-on-one meetings and action items</p>
        </div>
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule 1-on-1 Meeting</DialogTitle>
              <DialogDescription>Schedule a new one-on-one meeting with your team member</DialogDescription>
            </DialogHeader>
            <ScheduleMeetingForm 
              templates={templates}
              onSubmit={(meeting) => {
                onScheduleMeeting?.(meeting);
                setIsScheduleDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming ({upcomingMeetings.length})</TabsTrigger>
          <TabsTrigger value="history">History ({pastMeetings.length})</TabsTrigger>
          <TabsTrigger value="actions">Action Items ({allActionItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming meetings scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingMeetings.map((meeting) => (
                <Card key={meeting.id} className="hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => setSelectedMeeting(meeting)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{meeting.employeeName}</span>
                          <span className="text-muted-foreground">with</span>
                          <span className="font-semibold">{meeting.managerName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(meeting.scheduledDate), "PPP")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {meeting.duration} minutes
                          </div>
                          {meeting.recurringSchedule && (
                            <Badge variant="outline">{meeting.recurringSchedule.frequency}</Badge>
                          )}
                        </div>
                        {meeting.agendaItems.length > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">{meeting.agendaItems.length} agenda items</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {pastMeetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No meeting history yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastMeetings.map((meeting) => (
                <Card key={meeting.id} className="hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => setSelectedMeeting(meeting)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{meeting.employeeName}</span>
                          {getStatusBadge(meeting.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(meeting.scheduledDate), "PPP")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {meeting.duration} minutes
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">{meeting.actionItems.length} action items</span>
                          <span className="text-muted-foreground">
                            {meeting.actionItems.filter(a => a.status === 'completed').length} completed
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          {allActionItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending action items</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {allActionItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {getActionItemStatusIcon(item.status)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium">{item.description}</p>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Assigned to: {item.assignedToName}</span>
                          <span>Due: {format(new Date(item.dueDate), "PP")}</span>
                          <span>From meeting: {format(new Date(item.meetingDate), "PP")}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const updatedItem = { ...item, status: 'completed' as const, completedAt: new Date().toISOString() };
                          onUpdateActionItem?.(item.meetingId, updatedItem);
                        }}
                        disabled={item.status === 'completed'}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Meeting Detail Dialog */}
      {selectedMeeting && (
        <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Meeting Details</DialogTitle>
              <DialogDescription>
                {format(new Date(selectedMeeting.scheduledDate), "PPP")} - {selectedMeeting.duration} minutes
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Participants */}
                <div>
                  <h4 className="font-semibold mb-2">Participants</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedMeeting.employeeName}</Badge>
                    <Badge variant="outline">{selectedMeeting.managerName}</Badge>
                  </div>
                </div>

                <Separator />

                {/* Agenda Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Agenda</h4>
                    {selectedMeeting.status === 'scheduled' && (
                      <Button variant="outline" size="sm">Edit Agenda</Button>
                    )}
                  </div>
                  {selectedMeeting.agendaItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No agenda items</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedMeeting.agendaItems.sort((a, b) => a.order - b.order).map((item) => (
                        <div key={item.id} className="space-y-2">
                          <h5 className="font-medium">{item.sectionTitle}</h5>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Action Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Action Items ({selectedMeeting.actionItems.length})</h4>
                    <Button variant="outline" size="sm" onClick={() => setIsActionItemDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {selectedMeeting.actionItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No action items</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedMeeting.actionItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
                          {getActionItemStatusIcon(item.status)}
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{item.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{item.assignedToName}</span>
                              <span>•</span>
                              <span>Due {format(new Date(item.dueDate), "PP")}</span>
                              <span>•</span>
                              {getPriorityBadge(item.priority)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Private Notes */}
                {selectedMeeting.privateNotes && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold">Private Notes</h4>
                      {selectedMeeting.privateNotes.employeeNotes && (
                        <div>
                          <Label className="text-sm font-medium">Employee Notes</Label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedMeeting.privateNotes.employeeNotes}</p>
                        </div>
                      )}
                      {selectedMeeting.privateNotes.managerNotes && (
                        <div>
                          <Label className="text-sm font-medium">Manager Notes</Label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedMeeting.privateNotes.managerNotes}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedMeeting(null)}>Close</Button>
              {selectedMeeting.status === 'scheduled' && (
                <Button onClick={() => {
                  const updated = { ...selectedMeeting, status: 'completed' as const, completedAt: new Date().toISOString() };
                  onUpdateMeeting?.(updated);
                  setSelectedMeeting(null);
                }}>
                  Mark as Complete
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Schedule Meeting Form Component
function ScheduleMeetingForm({ templates, onSubmit }: { templates: MeetingAgendaTemplate[]; onSubmit: (meeting: OneOnOneMeeting) => void }) {
  const [date, setDate] = useState<Date>();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Employee</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emp-1">John Smith</SelectItem>
              <SelectItem value="emp-2">Sarah Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Manager</Label>
          <Input placeholder="Current user" disabled />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Duration (minutes)</Label>
          <Select defaultValue="30">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Agenda Template (Optional)</Label>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No template</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Recurring Meeting</Label>
        <Select defaultValue="none">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">One-time meeting</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Bi-weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit" onClick={() => onSubmit({
          id: `meeting-${Date.now()}`,
          employeeId: 'emp-1',
          employeeName: 'John Smith',
          managerId: 'mgr-1',
          managerName: 'Current User',
          scheduledDate: date?.toISOString() || new Date().toISOString(),
          duration: 30,
          status: 'scheduled',
          templateId: selectedTemplate || undefined,
          agendaItems: [],
          actionItems: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })}>
          Schedule Meeting
        </Button>
      </DialogFooter>
    </div>
  );
}
