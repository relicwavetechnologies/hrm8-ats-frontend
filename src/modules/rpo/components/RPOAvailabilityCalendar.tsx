import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Progress } from '@/shared/components/ui/progress';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Plane,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';

interface Assignment {
  id: string;
  consultantId: string;
  clientName: string;
  projectName: string;
  startDate: string;
  endDate: string;
  hoursPerDay: number;
  priority: 'high' | 'medium' | 'low';
  color: string;
}

interface TimeOff {
  id: string;
  consultantId: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'training';
  status: 'approved' | 'pending' | 'rejected';
  reason?: string;
}

interface Consultant {
  id: string;
  name: string;
  avatar?: string;
  maxHoursPerDay: number;
  currentUtilization: number;
}

interface DayCapacity {
  date: string;
  consultantId: string;
  totalHours: number;
  availableHours: number;
  assignments: Assignment[];
  timeOff?: TimeOff;
  hasConflict: boolean;
}

export function RPOAvailabilityCalendar() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedConsultant, setSelectedConsultant] = useState<string>('all');
  const [draggedAssignment, setDraggedAssignment] = useState<Assignment | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [timeOffDialogOpen, setTimeOffDialogOpen] = useState(false);

  // Mock data
  const consultants: Consultant[] = [
    { id: '1', name: 'Sarah Johnson', maxHoursPerDay: 8, currentUtilization: 85 },
    { id: '2', name: 'Michael Chen', maxHoursPerDay: 8, currentUtilization: 60 },
    { id: '3', name: 'Emily Rodriguez', maxHoursPerDay: 8, currentUtilization: 90 },
    { id: '4', name: 'David Kim', maxHoursPerDay: 8, currentUtilization: 100 },
    { id: '5', name: 'Lisa Thompson', maxHoursPerDay: 8, currentUtilization: 50 },
  ];

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 'a1',
      consultantId: '1',
      clientName: 'TechCorp',
      projectName: 'Backend Developer Search',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
      hoursPerDay: 6,
      priority: 'high',
      color: 'hsl(217, 91%, 60%)'
    },
    {
      id: 'a2',
      consultantId: '1',
      clientName: 'GlobalCo',
      projectName: 'Frontend Team',
      startDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      hoursPerDay: 4,
      priority: 'medium',
      color: 'hsl(142, 76%, 36%)'
    },
    {
      id: 'a3',
      consultantId: '2',
      clientName: 'HealthTech',
      projectName: 'Medical Staff Recruitment',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      hoursPerDay: 5,
      priority: 'high',
      color: 'hsl(48, 96%, 53%)'
    }
  ]);

  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([
    {
      id: 't1',
      consultantId: '3',
      startDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
      type: 'vacation',
      status: 'approved',
      reason: 'Family vacation'
    },
    {
      id: 't2',
      consultantId: '4',
      startDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      type: 'personal',
      status: 'approved'
    }
  ]);

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const calculateDayCapacity = (consultantId: string, date: Date): DayCapacity => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const consultant = consultants.find(c => c.id === consultantId);
    const dayAssignments = assignments.filter(a => 
      a.consultantId === consultantId &&
      dateStr >= a.startDate &&
      dateStr <= a.endDate
    );
    const timeOff = timeOffs.find(t => 
      t.consultantId === consultantId &&
      dateStr >= t.startDate &&
      dateStr <= t.endDate &&
      t.status === 'approved'
    );

    const totalHours = dayAssignments.reduce((acc, a) => acc + a.hoursPerDay, 0);
    const maxHours = consultant?.maxHoursPerDay || 8;
    const hasConflict = totalHours > maxHours || (timeOff !== undefined && dayAssignments.length > 0);

    return {
      date: dateStr,
      consultantId,
      totalHours,
      availableHours: timeOff ? 0 : Math.max(0, maxHours - totalHours),
      assignments: dayAssignments,
      timeOff,
      hasConflict
    };
  };

  const handleDragStart = (assignment: Assignment) => {
    setDraggedAssignment(assignment);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (consultantId: string, date: Date) => {
    if (!draggedAssignment) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const dayCapacity = calculateDayCapacity(consultantId, date);

    // Check for conflicts
    if (dayCapacity.timeOff) {
      toast({
        title: 'Cannot Assign',
        description: 'Consultant has time off on this date.',
        variant: 'destructive'
      });
      setDraggedAssignment(null);
      return;
    }

    if (dayCapacity.availableHours < draggedAssignment.hoursPerDay) {
      toast({
        title: 'Capacity Exceeded',
        description: `Only ${dayCapacity.availableHours}h available. Assignment requires ${draggedAssignment.hoursPerDay}h.`,
        variant: 'destructive'
      });
      setDraggedAssignment(null);
      return;
    }

    // Update assignment
    setAssignments(prev => prev.map(a => 
      a.id === draggedAssignment.id 
        ? { ...a, consultantId, startDate: dateStr, endDate: dateStr }
        : a
    ));

    toast({
      title: 'Assignment Updated',
      description: `Moved to ${consultants.find(c => c.id === consultantId)?.name} on ${format(date, 'MMM dd')}`,
    });

    setDraggedAssignment(null);
  };

  const addAssignment = () => {
    toast({
      title: 'Assignment Created',
      description: 'New assignment has been added to the calendar.',
    });
    setAssignmentDialogOpen(false);
  };

  const addTimeOff = () => {
    toast({
      title: 'Time Off Requested',
      description: 'Time off request has been submitted for approval.',
    });
    setTimeOffDialogOpen(false);
  };

  const getTimeOffIcon = (type: string) => {
    if (type === 'vacation') return <Plane className="h-3 w-3" />;
    if (type === 'training') return <Briefcase className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'border-red-500';
    if (priority === 'medium') return 'border-yellow-500';
    return 'border-blue-500';
  };

  const filteredConsultants = selectedConsultant === 'all' 
    ? consultants 
    : consultants.filter(c => c.id === selectedConsultant);

  const weekDays = getWeekDays();
  const totalCapacity = filteredConsultants.length * 8 * 7; // consultants * hours * days
  const usedCapacity = filteredConsultants.reduce((acc, c) => {
    return acc + weekDays.reduce((dayAcc, day) => {
      const capacity = calculateDayCapacity(c.id, day);
      return dayAcc + capacity.totalHours;
    }, 0);
  }, 0);
  const utilizationRate = (usedCapacity / totalCapacity) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Availability Calendar</h2>
          <p className="text-muted-foreground">Real-time scheduling with conflict detection</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
                <DialogDescription>Schedule a new client assignment</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="consultant">Consultant</Label>
                  <Select>
                    <SelectTrigger id="consultant">
                      <SelectValue placeholder="Select consultant" />
                    </SelectTrigger>
                    <SelectContent>
                      {consultants.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client Name</Label>
                  <Input id="client" placeholder="Enter client name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project Name</Label>
                  <Input id="project" placeholder="Enter project name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours Per Day</Label>
                  <Input id="hours" type="number" min="1" max="8" defaultValue="8" />
                </div>
                <Button onClick={addAssignment} className="w-full">Create Assignment</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={timeOffDialogOpen} onOpenChange={setTimeOffDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Request Time Off
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Time Off</DialogTitle>
                <DialogDescription>Submit time off request for approval</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timeOffConsultant">Consultant</Label>
                  <Select>
                    <SelectTrigger id="timeOffConsultant">
                      <SelectValue placeholder="Select consultant" />
                    </SelectTrigger>
                    <SelectContent>
                      {consultants.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeOffType">Type</Label>
                  <Select>
                    <SelectTrigger id="timeOffType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeOffStart">Start Date</Label>
                    <Input id="timeOffStart" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeOffEnd">End Date</Label>
                    <Input id="timeOffEnd" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea id="reason" placeholder="Enter reason..." />
                </div>
                <Button onClick={addTimeOff} className="w-full">Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Week Utilization</p>
                <p className="text-2xl font-bold">{utilizationRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <Progress value={utilizationRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Hours</p>
                <p className="text-2xl font-bold">{totalCapacity - usedCapacity}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Assignments</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Off Requests</p>
                <p className="text-2xl font-bold">{timeOffs.filter(t => t.status === 'pending').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center min-w-[200px]">
                  <p className="font-semibold">
                    {format(weekDays[0], 'MMM dd')} - {format(weekDays[6], 'MMM dd, yyyy')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                  Today
                </Button>
              </div>

              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Consultants</SelectItem>
                  {consultants.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                Available
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950">
                <AlertTriangle className="h-3 w-3 mr-1 text-yellow-600" />
                Busy
              </Badge>
              <Badge variant="outline" className="bg-red-50 dark:bg-red-950">
                <XCircle className="h-3 w-3 mr-1 text-destructive" />
                Overbooked
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-4 font-semibold bg-muted">Consultant</div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="p-4 text-center border-l">
                    <div className="font-semibold">{format(day, 'EEE')}</div>
                    <div className="text-sm text-muted-foreground">{format(day, 'MMM dd')}</div>
                  </div>
                ))}
              </div>

              {/* Consultant Rows */}
              {filteredConsultants.map(consultant => (
                <div key={consultant.id} className="grid grid-cols-8 border-b hover:bg-muted/50">
                  <div className="p-4 flex items-center gap-3 bg-muted/30">
                    <div>
                      <p className="font-medium">{consultant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {consultant.currentUtilization}% utilized
                      </p>
                    </div>
                  </div>

                  {weekDays.map(day => {
                    const capacity = calculateDayCapacity(consultant.id, day);
                    const utilizationPercent = (capacity.totalHours / consultant.maxHoursPerDay) * 100;

                    return (
                      <div
                        key={day.toISOString()}
                        className={`p-2 border-l min-h-[120px] ${
                          capacity.hasConflict ? 'bg-red-50 dark:bg-red-950' :
                          capacity.timeOff ? 'bg-gray-100 dark:bg-gray-900' :
                          utilizationPercent > 85 ? 'bg-yellow-50 dark:bg-yellow-950' :
                          'bg-background'
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(consultant.id, day)}
                      >
                        {/* Time Off Badge */}
                        {capacity.timeOff && (
                          <Badge variant="secondary" className="mb-2 w-full text-xs">
                            {getTimeOffIcon(capacity.timeOff.type)}
                            <span className="ml-1">{capacity.timeOff.type}</span>
                          </Badge>
                        )}

                        {/* Assignments */}
                        <div className="space-y-1">
                          {capacity.assignments.map(assignment => (
                            <div
                              key={assignment.id}
                              draggable
                              onDragStart={() => handleDragStart(assignment)}
                              className={`p-2 rounded text-xs cursor-move border-l-4 ${getPriorityColor(assignment.priority)} bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow`}
                            >
                              <p className="font-medium truncate">{assignment.clientName}</p>
                              <p className="text-muted-foreground truncate">{assignment.projectName}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-medium">{assignment.hoursPerDay}h</span>
                                <Badge variant="outline" className="text-xs">{assignment.priority}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Capacity Info */}
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex justify-between text-xs">
                            <span className={capacity.hasConflict ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                              {capacity.totalHours}h / {consultant.maxHoursPerDay}h
                            </span>
                            {capacity.hasConflict && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Alert */}
      {filteredConsultants.some(c => 
        weekDays.some(day => calculateDayCapacity(c.id, day).hasConflict)
      ) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Scheduling Conflicts Detected:</strong> Some consultants have overlapping assignments or are overbooked. Please review and adjust assignments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
