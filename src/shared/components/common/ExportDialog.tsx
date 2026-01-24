import { useState } from "react";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: any[];
  filename: string;
  availableFields?: { key: string; label: string }[];
}

export function ExportDialog({
  open,
  onOpenChange,
  title,
  data,
  filename,
  availableFields = [],
}: ExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    availableFields.map(f => f.key)
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleToggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(availableFields.map(f => f.key));
    }
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field to export");
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter data to only include selected fields
      const filteredData = data.map(item => {
        const filtered: any = {};
        selectedFields.forEach(field => {
          filtered[field] = item[field];
        });
        return filtered;
      });

      // In a real implementation, you would use libraries like:
      // - papaparse for CSV
      // - xlsx for Excel
      // - jspdf with jspdf-autotable for PDF

      if (format === 'csv') {
        // Mock CSV export
        const csvContent = convertToCSV(filteredData);
        downloadFile(csvContent, `${filename}.csv`, 'text/csv');
      } else if (format === 'excel') {
        // Mock Excel export
        toast.info("Excel export would be implemented with xlsx library");
      } else if (format === 'pdf') {
        // Mock PDF export
        toast.info("PDF export would be implemented with jspdf library");
      }

      toast.success(`Exported ${data.length} records as ${format.toUpperCase()}`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    const headers = selectedFields
      .map(key => availableFields.find(f => f.key === key)?.label || key)
      .join(',');
    
    const rows = data.map(item =>
      selectedFields.map(key => {
        const value = item[key];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );

    return [headers, ...rows].join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choose export format and select fields to include in the export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v: any) => setFormat(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  CSV (Comma-separated values)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel (.xlsx)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <File className="h-4 w-4" />
                  PDF Document
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Field Selection */}
          {availableFields.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Fields to Export</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedFields.length === availableFields.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {availableFields.map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => handleToggleField(field.key)}
                    />
                    <Label
                      htmlFor={field.key}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedFields.length} of {availableFields.length} fields selected
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Records to Export:</span>
              <span className="font-medium">{data.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium uppercase">{format}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Filename:</span>
              <span className="font-medium">{filename}.{format === 'excel' ? 'xlsx' : format}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedFields.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
