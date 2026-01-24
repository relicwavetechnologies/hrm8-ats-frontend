import { useState } from 'react';
import type { RPOTask } from '@/shared/types/rpoTask';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Calendar, Clock, User } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { updateRPOTask } from '@/shared/lib/rpoTaskStorage';
import { RPOTaskDialog } from './RPOTaskDialog';

interface RPOTaskBoardProps {
  tasks: RPOTask[];
  onTasksChange: () => void;
}

const statusColumns = [
  { status: 'pending' as const, title: 'Pending', color: 'bg-slate-100' },
  { status: 'in-progress' as const, title: 'In Progress', color: 'bg-blue-100' },
  { status: 'completed' as const, title: 'Completed', color: 'bg-green-100' },
  { status: 'blocked' as const, title: 'Blocked', color: 'bg-red-100' },
];

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export function RPOTaskBoard({ tasks, onTasksChange }: RPOTaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<RPOTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStatusChange = (taskId: string, newStatus: RPOTask['status']) => {
    const updates: Partial<RPOTask> = { status: newStatus };
    if (newStatus === 'completed' && !tasks.find(t => t.id === taskId)?.completedDate) {
      updates.completedDate = new Date().toISOString();
    }
    updateRPOTask(taskId, updates);
    onTasksChange();
  };

  const handleTaskClick = (task: RPOTask) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
    onTasksChange();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Task Board</h2>
        <Button onClick={() => {
          setSelectedTask(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {statusColumns.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.status);
          
          return (
            <Card key={column.status} className={cn('min-h-[400px]', column.color)}>
              <CardHeader>
                <CardTitle className="text-lg">{column.title}</CardTitle>
                <CardDescription>{columnTasks.length} tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnTasks.map(task => {
                  const isOverdue = task.status !== 'completed' && isPast(new Date(task.dueDate));
                  
                  return (
                    <Card
                      key={task.id}
                      className={cn(
                        'cursor-pointer hover:shadow-md transition-shadow bg-card',
                        isOverdue && 'border-destructive'
                      )}
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm">{task.title}</h4>
                          <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', priorityColors[task.priority])} />
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {task.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">{task.assignedConsultantName}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span className={cn(isOverdue && 'text-destructive font-semibold')}>
                            {format(new Date(task.dueDate), 'MMM dd')}
                          </span>
                          {isOverdue && (
                            <Badge variant="destructive" className="ml-1 text-xs">Overdue</Badge>
                          )}
                        </div>
                        
                        {task.estimatedHours && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedHours}h estimated</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RPOTaskDialog
        task={selectedTask}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={handleDialogClose}
      />
    </>
  );
}
