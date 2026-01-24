import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { exportToExcel, exportToCSV } from "@/shared/lib/importExportService";
import { Candidate } from "@/shared/types/entities";

interface CandidateExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
  selectedCandidates?: Candidate[];
}

const EXPORT_FIELDS = [
  { key: 'name', label: 'Name', default: true },
  { key: 'email', label: 'Email', default: true },
  { key: 'phone', label: 'Phone', default: true },
  { key: 'location', label: 'Location', default: true },
  { key: 'currentRole', label: 'Current Role', default: true },
  { key: 'experience', label: 'Experience', default: true },
  { key: 'skills', label: 'Skills', default: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'stage', label: 'Stage', default: true },
  { key: 'priority', label: 'Priority', default: false },
  { key: 'rating', label: 'Rating', default: false },
  { key: 'source', label: 'Source', default: false },
  { key: 'appliedDate', label: 'Applied Date', default: false },
  { key: 'lastContact', label: 'Last Contact', default: false },
  { key: 'notes', label: 'Notes', default: false },
];

export function CandidateExportDialog({ open, onOpenChange, candidates, selectedCandidates }: CandidateExportDialogProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<'excel' | 'csv'>('excel');
  const [exportScope, setExportScope] = useState<'all' | 'selected'>('all');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter(f => f.default).map(f => f.key)
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(k => k !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(EXPORT_FIELDS.map(f => f.key));
  };

  const handleSelectDefault = () => {
    setSelectedFields(EXPORT_FIELDS.filter(f => f.default).map(f => f.key));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dataToExport = exportScope === 'selected' && selectedCandidates?.length 
        ? selectedCandidates 
        : candidates;

      if (dataToExport.length === 0) {
        toast({
          title: "No data to export",
          description: "Please select candidates or ensure there is data to export",
          variant: "destructive",
        });
        setIsExporting(false);
        return;
      }

      // Transform data to include only selected fields
      const transformedData = dataToExport.map(candidate => {
        const transformed: any = {};
        selectedFields.forEach(field => {
          if (field === 'skills' && Array.isArray(candidate.skills)) {
            transformed[field] = candidate.skills.join(', ');
          } else {
            transformed[field] = (candidate as any)[field];
          }
        });
        return transformed;
      });

      const filename = `candidates_export_${new Date().toISOString().split('T')[0]}`;

      if (format === 'excel') {
        exportToExcel(transformedData, selectedFields, filename);
      } else {
        exportToCSV(transformedData, selectedFields, filename);
      }

      toast({
        title: "Export successful",
        description: `${dataToExport.length} candidates exported as ${format.toUpperCase()}`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export candidates",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Export Candidates</DialogTitle>
          <DialogDescription>
            Choose format and fields to export
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 p-4">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label>Export Format</Label>
              <RadioGroup value={format} onValueChange={(v: any) => setFormat(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="font-normal cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (.xlsx)
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="font-normal cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV (.csv)
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Scope Selection */}
            <div className="space-y-3">
              <Label>Export Scope</Label>
              <RadioGroup value={exportScope} onValueChange={(v: any) => setExportScope(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All candidates ({candidates.length})
                  </Label>
                </div>
                {selectedCandidates && selectedCandidates.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="selected" />
                    <Label htmlFor="selected" className="font-normal cursor-pointer">
                      Selected candidates ({selectedCandidates.length})
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* Field Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select Fields</Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSelectDefault}>
                    Default
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {EXPORT_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => handleFieldToggle(field.key)}
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
              
              <p className="text-sm text-muted-foreground">
                {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedFields.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
