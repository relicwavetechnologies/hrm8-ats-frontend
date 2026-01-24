import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Employee } from '@/shared/types/employee';
import { getEmployees } from '@/shared/lib/employeeStorage';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployees?: Employee[];
}

const EXPORT_FIELDS = [
  { key: 'employeeId', label: 'Employee ID', default: true },
  { key: 'firstName', label: 'First Name', default: true },
  { key: 'lastName', label: 'Last Name', default: true },
  { key: 'email', label: 'Email', default: true },
  { key: 'phone', label: 'Phone', default: true },
  { key: 'dateOfBirth', label: 'Date of Birth', default: false },
  { key: 'gender', label: 'Gender', default: false },
  { key: 'jobTitle', label: 'Job Title', default: true },
  { key: 'department', label: 'Department', default: true },
  { key: 'location', label: 'Location', default: true },
  { key: 'employmentType', label: 'Employment Type', default: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'hireDate', label: 'Hire Date', default: true },
  { key: 'startDate', label: 'Start Date', default: false },
  { key: 'salary', label: 'Salary', default: false },
  { key: 'currency', label: 'Currency', default: false },
  { key: 'payFrequency', label: 'Pay Frequency', default: false },
  { key: 'address', label: 'Address', default: false },
  { key: 'city', label: 'City', default: false },
  { key: 'state', label: 'State', default: false },
  { key: 'postalCode', label: 'Postal Code', default: false },
  { key: 'country', label: 'Country', default: false },
  { key: 'managerName', label: 'Manager Name', default: false },
  { key: 'emergencyContactName', label: 'Emergency Contact Name', default: false },
  { key: 'emergencyContactPhone', label: 'Emergency Contact Phone', default: false },
  { key: 'emergencyContactRelationship', label: 'Emergency Contact Relationship', default: false },
  { key: 'avatar', label: 'Photo URL', default: false },
];

export function ExportDialog({ open, onOpenChange, selectedEmployees }: ExportDialogProps) {
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter(f => f.default).map(f => f.key)
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(EXPORT_FIELDS.map(f => f.key));
  };

  const handleSelectDefault = () => {
    setSelectedFields(EXPORT_FIELDS.filter(f => f.default).map(f => f.key));
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    setIsExporting(true);

    try {
      const employees = selectedEmployees || getEmployees();
      
      if (employees.length === 0) {
        toast.error('No employees to export');
        setIsExporting(false);
        return;
      }

      // Prepare data with selected fields
      const exportData = employees.map(emp => {
        const row: any = {};
        selectedFields.forEach(field => {
          const fieldConfig = EXPORT_FIELDS.find(f => f.key === field);
          if (fieldConfig) {
            row[fieldConfig.label] = (emp as any)[field] || '';
          }
        });
        return row;
      });

      if (format === 'xlsx') {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employees');
        
        // Set column widths
        const colWidths = selectedFields.map(() => ({ wch: 20 }));
        ws['!cols'] = colWidths;

        const filename = `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
      } else {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success(`Exported ${employees.length} employee records`);
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Employee Data
          </DialogTitle>
          <DialogDescription>
            Choose format and fields to export
            {selectedEmployees && ` (${selectedEmployees.length} selected)`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel (.xlsx)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  CSV (.csv)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fields to Export</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectDefault}
                >
                  Default
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                {EXPORT_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => handleFieldToggle(field.key)}
                    />
                    <Label
                      htmlFor={field.key}
                      className="text-sm cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <p className="text-sm text-muted-foreground">
              {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedFields.length === 0}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
