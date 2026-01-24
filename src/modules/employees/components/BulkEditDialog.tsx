import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Employee } from '@/shared/types/employee';
import { saveEmployee } from '@/shared/lib/employeeStorage';
import { Badge } from '@/shared/components/ui/badge';

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployees: Employee[];
  onSuccess: () => void;
}

export function BulkEditDialog({ open, onOpenChange, selectedEmployees, onSuccess }: BulkEditDialogProps) {
  const [field, setField] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const EDITABLE_FIELDS = [
    { value: 'department', label: 'Department', type: 'select', options: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Human Resources', 'Finance'] },
    { value: 'location', label: 'Location', type: 'select', options: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Los Angeles, CA', 'Remote'] },
    { value: 'status', label: 'Status', type: 'select', options: ['active', 'on-leave', 'notice-period', 'inactive'] },
    { value: 'employmentType', label: 'Employment Type', type: 'select', options: ['full-time', 'part-time', 'contract', 'intern', 'casual'] },
    { value: 'managerName', label: 'Manager Name', type: 'text' },
    { value: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
    { value: 'payFrequency', label: 'Pay Frequency', type: 'select', options: ['hourly', 'weekly', 'biweekly', 'monthly', 'annually'] },
  ];

  const handleUpdate = async () => {
    if (!field || !value) {
      toast.error('Please select a field and enter a value');
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error('No employees selected');
      return;
    }

    setIsUpdating(true);

    try {
      let successCount = 0;

      for (const employee of selectedEmployees) {
        const updated = {
          ...employee,
          [field]: value,
          updatedAt: new Date().toISOString(),
        };
        
        saveEmployee(updated);
        successCount++;
      }

      toast.success(`Updated ${successCount} employee${successCount !== 1 ? 's' : ''}`);
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setField('');
      setValue('');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update employees');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setField('');
    setValue('');
    onOpenChange(false);
  };

  const selectedField = EDITABLE_FIELDS.find(f => f.value === field);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Bulk Edit Employees
          </DialogTitle>
          <DialogDescription>
            Update a field for {selectedEmployees.length} selected employee{selectedEmployees.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Field to Update</Label>
            <Select value={field} onValueChange={(v) => { setField(v); setValue(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {EDITABLE_FIELDS.map(f => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {field && (
            <div className="space-y-2">
              <Label>New Value</Label>
              {selectedField?.type === 'select' ? (
                <Select value={value} onValueChange={setValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {selectedField.options?.map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`Enter ${selectedField?.label.toLowerCase()}`}
                />
              )}
            </div>
          )}

          {selectedEmployees.length > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected Employees:</p>
              <div className="flex flex-wrap gap-2">
                {selectedEmployees.slice(0, 5).map(emp => (
                  <Badge key={emp.id} variant="outline">
                    {emp.firstName} {emp.lastName}
                  </Badge>
                ))}
                {selectedEmployees.length > 5 && (
                  <Badge variant="outline">
                    +{selectedEmployees.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating || !field || !value}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Update {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
