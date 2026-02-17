import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2, CheckCircle2, Circle, PlayCircle, XCircle, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { Application } from '@/shared/types/application';
import { DateTimePicker } from '@/shared/components/ui/date-time-picker';
import {
  taskTemplates,
  getPriorityColor,
  getStatusColor,
  type TaskPriority,
  type TaskStatus,
} from '@/shared/lib/taskTemplates';

interface CreateTaskTabProps {
  application: Application;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  creator?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
  };
}

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case 'PENDING':
      return Circle;
    case 'IN_PROGRESS':
      return PlayCircle;
    case 'COMPLETED':
      return CheckCircle2;
    case 'CANCELLED':
      return XCircle;
    default:
      return Circle;
  }
}

import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { History, CheckSquare, ListTodo } from 'lucide-react';

export function CreateTaskTab({ application }: CreateTaskTabProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<Date>();
  const [type, setType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  const candidateName = application.candidateName || 'Candidate';

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!application.id) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get<{ tasks: Task[] }>(
          `/api/applications/${application.id}/tasks`
        );
        if (response.success && response.data?.tasks) {
          setTasks(response.data.tasks);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [application.id]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = taskTemplates.find((t) => t.id === templateId);
    if (template) {
      setTitle(template.title);
      setDescription(template.description);
      setPriority(template.priority);
      setType(template.type);
      toast({
        title: 'Template loaded',
        description: `"${template.title}" template applied`,
      });
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a task title',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await apiClient.post<{ task: Task }>(
        `/api/applications/${application.id}/tasks`,
        {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          type: type.trim() || undefined,
          dueDate: dueDate?.toISOString(),
        }
      );

      if (response.success && response.data?.task) {
        toast({
          title: 'Task created!',
          description: `Task "${title}" has been created`,
        });
        setTasks((prev) => [response.data.task, ...prev]);
        // Reset form
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setDueDate(undefined);
        setType('');
        setSelectedTemplate('');
      } else {
        throw new Error(response.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      toast({
        title: 'Failed to create task',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await apiClient.put<{ task: Task }>(
        `/api/applications/${application.id}/tasks/${taskId}`,
        { status: newStatus }
      );

      if (response.success && response.data?.task) {
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? response.data.task : task))
        );
        toast({
          title: 'Status updated',
          description: `Task status changed to ${newStatus.replace('_', ' ')}`,
        });
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({
        title: 'Failed to update status',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="flex flex-col h-full space-y-2 py-2 overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between px-1 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex-shrink-0">Task:</span>
          <div className="bg-orange-500/10 px-2 py-0.5 rounded-full flex items-center gap-1.5 truncate border border-orange-500/20">
            <CheckSquare className="h-2.5 w-2.5 text-orange-600" />
            <span className="text-[10px] font-bold text-orange-600 truncate">{candidateName}</span>
          </div>
        </div>
        <Button
          onClick={handleCreateTask}
          disabled={!title.trim() || isCreating}
          className="h-7 px-3 text-[11px] font-bold shadow-sm"
          size="sm"
        >
          {isCreating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-3 w-3" />
              <span>Create</span>
            </div>
          )}
        </Button>
      </div>

      {/* Toolbar: Templates & History */}
      <div className="flex items-center gap-2 px-1 border-b pb-1">
        <div className="flex-1 max-w-[160px]">
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="text-[11px] h-7 bg-transparent border-none hover:bg-muted/50 p-0 px-2 [&>span]:truncate">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <ListTodo className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Quick Tasks" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {taskTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <span className="text-[11px]">{template.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-4 w-px bg-muted-foreground/20" />

        {/* History/Queue Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-[11px] hover:bg-muted/50">
              <History className="h-3.5 w-3.5" />
              Queue
              {pendingCount > 0 && (
                <Badge variant="destructive" className="px-1 h-3.5 min-w-[14px] text-[9px]">
                  {pendingCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-xl border-muted" side="bottom" align="end">
            <div className="p-3 border-b bg-muted/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task Queue</h4>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-2">
                {isLoading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : tasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">No tasks in queue</div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-2.5 bg-muted/20 rounded border text-[11px] space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h6 className="font-semibold truncate">{task.title}</h6>
                          <Badge variant="outline" className={`text-[8px] h-3.5 px-1 ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                        </div>
                        <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}>
                          <SelectTrigger className="h-5 w-5 p-0 border-none bg-transparent">
                            {React.createElement(getStatusIcon(task.status), { className: `h-3.5 w-3.5 ${task.status === 'COMPLETED' ? 'text-green-600' : 'text-muted-foreground'}` })}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {task.description && <p className="text-muted-foreground text-[10px] line-clamp-2 italic">{task.description}</p>}
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><CalendarIcon className="h-2.5 w-2.5" /> {task.due_date ? format(parseISO(task.due_date), 'MMM d') : 'No due date'}</span>
                        <Badge variant="secondary" className={`px-1.5 py-0 h-3.5 text-[8px] ${getStatusColor(task.status)}`}>{task.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 min-h-0 px-1 pb-1 flex flex-col space-y-2">
        <div className="space-y-1">
          <Input
            placeholder="What needs to be done? *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-[11px] font-medium bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
            disabled={isCreating}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Priority</label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger className="text-[11px] h-7 bg-muted/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Due Date</label>
            <DateTimePicker
              date={dueDate}
              onDateChange={setDueDate}
              placeholder="Set deadline"
              disabled={isCreating}
              className="w-full h-7 px-2 text-[11px] bg-muted/20 border-none"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col space-y-1 min-h-0">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Description</label>
          <Textarea
            placeholder="Add details about this task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 resize-none text-[11px] leading-relaxed p-3 focus-visible:ring-primary/20 min-h-[50px]"
            disabled={isCreating}
          />
        </div>
      </div>
    </div>
  );
}

// TaskCard component
function TaskCard({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const StatusIcon = getStatusIcon(task.status);
  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && task.status !== 'COMPLETED';

  return (
    <Card className="shadow-sm">
      <CardContent className="py-2 px-2.5">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h6 className="text-xs font-medium truncate">{task.title}</h6>
              <Badge
                variant="outline"
                className={`text-[9px] px-1 py-0 h-3.5 ${getPriorityColor(task.priority)}`}
              >
                {task.priority}
              </Badge>
            </div>
            {task.description && (
              <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {task.type && (
                <span className="text-[9px] text-muted-foreground">{task.type}</span>
              )}
              {task.due_date && (
                <div
                  className={`flex items-center gap-0.5 text-[9px] ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                    }`}
                >
                  <CalendarIcon className="h-2.5 w-2.5" />
                  <span>{format(parseISO(task.due_date), 'MMM d')}</span>
                  {isOverdue && <span className="ml-0.5">(Overdue)</span>}
                </div>
              )}
            </div>
          </div>
          <Select
            value={task.status}
            onValueChange={(v) => onStatusChange(task.id, v as TaskStatus)}
          >
            <SelectTrigger className="h-6 w-6 p-0 border-none">
              <StatusIcon className={`h-4 w-4 ${task.status === 'COMPLETED' ? 'text-green-600' : 'text-muted-foreground'}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">
                <div className="flex items-center gap-2">
                  <Circle className="h-3.5 w-3.5" />
                  <span className="text-xs">Pending</span>
                </div>
              </SelectItem>
              <SelectItem value="IN_PROGRESS">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span className="text-xs">In Progress</span>
                </div>
              </SelectItem>
              <SelectItem value="COMPLETED">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs">Completed</span>
                </div>
              </SelectItem>
              <SelectItem value="CANCELLED">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3.5 w-3.5" />
                  <span className="text-xs">Cancelled</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
