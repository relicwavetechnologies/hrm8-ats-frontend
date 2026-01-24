import { useState, useEffect } from 'react';
import type { RPOTask } from '@/shared/types/rpoTask';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { createRPOTask, updateRPOTask, deleteRPOTask } from '@/shared/lib/rpoTaskStorage';
import { getAllServiceProjects } from '@/shared/lib/recruitmentServiceStorage';
import { getAllConsultants } from '@/shared/lib/consultantStorage';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface RPOTaskDialogProps {
  task: RPOTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function RPOTaskDialog({ task, open, onOpenChange, onClose }: RPOTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contractId: '',
    assignedConsultantId: '',
    status: 'pending' as RPOTask['status'],
    priority: 'medium' as RPOTask['priority'],
    type: 'sourcing' as RPOTask['type'],
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    estimatedHours: 0,
  });

  const rpoContracts = getAllServiceProjects().filter(p => p.isRPO && p.status === 'active');
  const consultants = getAllConsultants().filter(c => c.status === 'active');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        contractId: task.contractId,
        assignedConsultantId: task.assignedConsultantId,
        status: task.status,
        priority: task.priority,
        type: task.type,
        dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
        estimatedHours: task.estimatedHours,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        contractId: '',
        assignedConsultantId: '',
        status: 'pending',
        priority: 'medium',
        type: 'sourcing',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedHours: 0,
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contractId || !formData.assignedConsultantId) {
      toast.error('Please select a contract and consultant');
      return;
    }

    const contract = rpoContracts.find(c => c.id === formData.contractId);
    const consultant = consultants.find(c => c.id === formData.assignedConsultantId);

    if (!contract || !consultant) {
      toast.error('Invalid contract or consultant');
      return;
    }

    const consultantName = `${consultant.firstName} ${consultant.lastName}`;

    if (task) {
      updateRPOTask(task.id, {
        ...formData,
        contractName: contract.name,
        assignedConsultantName: consultantName,
        dueDate: new Date(formData.dueDate).toISOString(),
      });
      toast.success('Task updated successfully');
    } else {
      createRPOTask({
        ...formData,
        contractName: contract.name,
        assignedConsultantName: consultantName,
        dueDate: new Date(formData.dueDate).toISOString(),
      });
      toast.success('Task created successfully');
    }

    onClose();
  };

  const handleDelete = () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
      deleteRPOTask(task.id);
      toast.success('Task deleted successfully');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details and assignments' : 'Add a new task for RPO contract management'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract">RPO Contract</Label>
              <Select
                value={formData.contractId}
                onValueChange={value => setFormData({ ...formData, contractId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract" />
                </SelectTrigger>
                <SelectContent>
                  {rpoContracts.map(contract => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.name} - {contract.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultant">Assign To</Label>
              <Select
                value={formData.assignedConsultantId}
                onValueChange={value => setFormData({ ...formData, assignedConsultantId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map(consultant => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.firstName} {consultant.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: RPOTask['type']) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sourcing">Sourcing</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: RPOTask['priority']) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: RPOTask['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={e => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {task && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete Task
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
