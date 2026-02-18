import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { CalendarIcon, Plus, Trash2, CheckCircle2, Circle, Clock, MoreHorizontal, User, AlertCircle, MessageSquare, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";
import { apiClient } from "@/shared/lib/api";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";
import { Application } from "@/shared/types/application";

// --- Types ---
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface HiringTeamMember {
  userId: string;
  name: string;
  role: string;
  avatar?: string;
}

interface CreateTaskTabProps {
  application: Application;
  onTaskCreated?: () => void;
}

// --- Icons Helper ---
const PriorityIcon = ({ priority }: { priority: TaskPriority }) => {
  switch (priority) {
    case "URGENT": return <AlertCircle className="h-3 w-3 text-red-500" />;
    case "HIGH": return <Circle className="h-3 w-3 text-orange-500 fill-orange-500" />;
    case "MEDIUM": return <Circle className="h-3 w-3 text-yellow-500 fill-yellow-500" />;
    case "LOW": return <Circle className="h-3 w-3 text-blue-500" />;
    default: return <Circle className="h-3 w-3 text-muted-foreground" />;
  }
};

// --- Main Component: Task Creation Form ---
export function TaskCreationTab({ application, onTaskCreated }: CreateTaskTabProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [assigneeId, setAssigneeId] = useState<string>("unassigned");
  const [hiringTeam, setHiringTeam] = useState<HiringTeamMember[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const { toast } = useToast();

  // Mock templates
  const taskTemplates = [
    { id: "t1", title: "Schedule Interview", description: "Coordinate with candidate to schedule the next round of interviews." },
    { id: "t2", title: "Background Check", description: "Initiate background check process." },
    { id: "t3", title: "Reference Check", description: "Contact provided references." },
    { id: "t4", title: "Send Offer", description: "Prepare and send offer letter." },
  ];

  useEffect(() => {
    // Fetch hiring team
    const fetchTeam = async () => {
      if (application.jobId) {
        try {
          const response = await apiClient.get<HiringTeamMember[]>(`/api/jobs/${application.jobId}/team`);
          if (response.success && response.data) {
            setHiringTeam(response.data);
          }
        } catch (e) {
          console.error("Failed to fetch team", e);
        }
      }
    };
    fetchTeam();
  }, [application.jobId]);

  const handleTemplateSelect = (val: string) => {
    const template = taskTemplates.find(t => t.id === val);
    if (template) {
      setTitle(template.title);
      setDescription(template.description);
      setSelectedTemplate(val);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleCreateTask = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      const payload = {
        title,
        description: description + (description ? "\n\n" : "") + "[Note: Task Notes are appended to description]", // API workaround
        priority,
        dueDate: dueDate?.toISOString(),
        assignedTo: assigneeId === "unassigned" ? undefined : assigneeId,
        // application_id is in the URL param
      };

      const response = await apiClient.post(`/api/applications/${application.id}/tasks`, payload);

      if (response.success) {
        toast({ title: 'Task created successfully' });
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setDueDate(undefined);
        setAssigneeId("unassigned");
        setSelectedTemplate("");
        if (onTaskCreated) onTaskCreated();
      }
    } catch (error) {
      toast({ title: 'Failed to create task', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden tab-scroll-container">
      {/* Top Bar: Title & Actions */}
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0">
        <div className="flex-1">
          <Input
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-7 text-sm font-semibold border-none shadow-none px-0 focus-visible:ring-0 placeholder:font-normal"
          />
        </div>

        {/* Template Selector (Icon) */}
        <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
          <SelectTrigger className="h-7 w-7 p-0 border-none shadow-none text-muted-foreground hover:text-foreground">
            <FileText className="h-4 w-4" />
          </SelectTrigger>
          <SelectContent align="end">
            {taskTemplates.map(t => (
              <SelectItem key={t.id} value={t.id} className="text-xs">{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          size="sm"
          className="h-7 px-3 text-xs gap-1.5"
          onClick={handleCreateTask}
          disabled={isCreating || !title.trim()}
        >
          {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Create
        </Button>
      </div>

      {/* Properties Bar - Single Line */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/10 flex-shrink-0 overflow-x-auto scrollbar-none">
        {/* Priority */}
        <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
          <SelectTrigger className="h-6 text-[10px] w-auto gap-1.5 bg-background shadow-sm border-dashed px-2 min-w-[80px]">
            <Circle className="h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>

        {/* Due Date */}
        <div className="w-[110px]">
          <DateTimePicker
            date={dueDate}
            onDateChange={setDueDate}
            placeholder="Due Date"
            className="h-6 text-[10px] bg-background shadow-sm border-dashed px-2"
          />
        </div>

        {/* Assignee */}
        <div className="flex-1 min-w-[120px]">
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger className="h-6 text-[10px] w-full gap-1.5 bg-background shadow-sm border-dashed px-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned" className="text-xs italic text-muted-foreground">Unassigned</SelectItem>
              {hiringTeam.map(member => (
                <SelectItem key={member.userId} value={member.userId} className="text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description - Fills remaining space */}
      <div className="flex-1 min-h-0 relative">
        <Textarea
          placeholder="Add details, context, or instructions..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="absolute inset-0 w-full h-full text-xs resize-none border-none p-3 focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

// --- Task List Component ---
export function TaskListTab({ application }: CreateTaskTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ tasks: any[] }>(`/api/applications/${application.id}/tasks`);
      if (response.success && response.data?.tasks) {
        setTasks(response.data.tasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date,
          assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name, avatar: t.assignee.avatar } : undefined,
          createdAt: t.created_at
        })));
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [application.id]);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/applications/${application.id}/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast({ title: "Task deleted" });
    } catch (e) { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await apiClient.put(`/api/applications/${application.id}/tasks/${task.id}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } catch (e) { toast({ title: "Failed to update", variant: "destructive" }); }
  };

  const handleAddNote = async (task: Task, note: string) => {
    if (!note.trim()) return;
    const timestamp = new Date().toLocaleString();
    const newDescription = task.description
      ? `${task.description}\n\n--- Note added on ${timestamp} ---\n${note}`
      : `--- Note added on ${timestamp} ---\n${note}`;

    try {
      await apiClient.put(`/api/applications/${application.id}/tasks/${task.id}`, { description: newDescription });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, description: newDescription } : t));
      toast({ title: "Note added" });
    } catch (e) { toast({ title: "Failed to add note", variant: "destructive" }); }
  };

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (tasks.length === 0) return <div className="p-8 text-center text-xs text-muted-foreground">No tasks found. Create one above!</div>;

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-2 p-1">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onAddNote={handleAddNote}
          />
        ))}
      </div>
    </ScrollArea>
  );
}


// --- Individual Task Item Component ---
function TaskItem({ task, onDelete, onToggleStatus, onAddNote }: {
  task: Task;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
  onAddNote: (task: Task, note: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const onSubmitNote = async () => {
    setIsSavingNote(true);
    await onAddNote(task, noteText);
    setNoteText("");
    setIsSavingNote(false);
  };

  return (
    <div className={cn("rounded-lg border bg-card transition-all overflow-hidden", task.status === 'COMPLETED' ? "bg-muted/30 border-dashed" : "hover:shadow-sm border-solid")}>
      {/* Header Row - Grid Layout for alignment */}
      <div
        className="grid grid-cols-[auto_1fr_auto] gap-3 p-3 cursor-pointer hover:bg-muted/20 transition-colors items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Status Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStatus(task); }}
          className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors mt-0.5"
          title={task.status === 'COMPLETED' ? "Mark as Pending" : "Mark as Completed"}
        >
          {task.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
        </button>

        {/* Main Content: Title & Details */}
        <div className="min-w-0 grid gap-1.5">
          <div className="flex items-center gap-2">
            <PriorityIcon priority={task.priority} />
            <span className={cn("text-sm font-medium truncate", task.status === 'COMPLETED' && "line-through text-muted-foreground")}>
              {task.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {/* Assignee - Explicit Name */}
            <div className="flex items-center gap-1.5" title="Assignee">
              {task.assignee ? (
                <>
                  <Avatar className="h-4 w-4 border border-background">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback className="text-[7px] bg-primary/10 text-primary">{task.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground/80">{task.assignee.name}</span>
                </>
              ) : (
                <>
                  <div className="h-4 w-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <User className="h-2.5 w-2.5 opacity-50" />
                  </div>
                  <span className="italic">Unassigned</span>
                </>
              )}
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className={cn("flex items-center gap-1.5", new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && "text-red-500 font-medium")}>
                <Clock className="h-3.5 w-3.5" />
                <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions & Expand Icon */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className={cn("transition-transform duration-200", isExpanded && "rotate-180")}>
            {/* Chevron usage removed to reduce import changes, using simple rotation on existing icon or similar if needed, 
                  but for now let's just use the layout. If we want a chevron, we need to import it. 
                  Let's stick to the click-to-expand behavior which is intuitive enough if consistent.
                  Actually, user said "easy to understand", so an arrow helps. 
                  I'll use MoreHorizontal as a placeholder for actions/expand if available or just rely on the whole row being clickable.
              */}
            {/* Adding specific import for ChevronDown would be better, but let's re-use existing icons or add to import if needed. 
                  Existing imports: CalendarIcon, Plus, Trash2, CheckCircle2, Circle, Clock, MoreHorizontal, User, AlertCircle, MessageSquare, Loader2, FileText.
                  I will check imports.
              */}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t bg-muted/5">
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h5 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Description & Notes</h5>
              <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/50 p-2 rounded border border-transparent hover:border-border transition-colors">
                {task.description || <span className="italic opacity-50 text-muted-foreground">No description provided.</span>}
              </div>
            </div>

            {/* Add Note Section */}
            <div className="space-y-2">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type a note..."
                className="min-h-[60px] text-sm resize-none bg-background focus:bg-background/100 transition-colors"
              />
              <div className="flex justify-end">
                <Button size="sm" className="h-7 text-xs" onClick={onSubmitNote} disabled={!noteText.trim() || isSavingNote}>
                  {isSavingNote ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Exporting TaskCreationTab and TaskListTab separately.
// CreateTaskTab is an alias for TaskCreationTab for backward compatibility.
export { TaskCreationTab as CreateTaskTab };
