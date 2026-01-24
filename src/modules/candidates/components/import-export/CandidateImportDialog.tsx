import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { parseFile, validateRow, detectDuplicates, CANDIDATE_FIELDS, type ImportField } from "@/shared/lib/importExportService";
import { Candidate } from "@/shared/types/entities";

interface CandidateImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCandidates: Candidate[];
  onImport: (candidates: Partial<Candidate>[], duplicateAction: 'skip' | 'update' | 'create') => Promise<void>;
}

export function CandidateImportDialog({ open, onOpenChange, existingCandidates, onImport }: CandidateImportDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>(('upload'));
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<ImportField[]>(CANDIDATE_FIELDS);
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'update' | 'create'>('skip');
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<{
    validCount: number;
    errorCount: number;
    duplicateCount: number;
    errors: any[];
    duplicates: any[];
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const { headers: fileHeaders, data: fileData } = await parseFile(selectedFile);
      setFile(selectedFile);
      setHeaders(fileHeaders);
      setData(fileData);
      setStep('mapping');
      
      toast({
        title: "File uploaded",
        description: `${fileData.length} rows found`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to parse file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleMappingChange = (targetField: string, sourceColumn: string) => {
    setMapping(prev => 
      prev.map(field => 
        field.targetField === targetField 
          ? { ...field, sourceColumn: sourceColumn || undefined }
          : field
      )
    );
  };

  const handleGeneratePreview = () => {
    const errors: any[] = [];
    let validCount = 0;

    data.forEach((row, index) => {
      const rowErrors = validateRow(row, mapping, 'candidates', index);
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validCount++;
      }
    });

    const duplicates = detectDuplicates(data, mapping, existingCandidates, 'candidates');

    setPreview({
      validCount,
      errorCount: errors.length,
      duplicateCount: duplicates.length,
      errors,
      duplicates,
    });

    setStep('preview');
  };

  const handleImport = async () => {
    if (!preview) return;

    setIsImporting(true);
    try {
      const transformedData = data.map((row) => {
        const transformed: any = {};
        mapping.forEach((field) => {
          if (field.sourceColumn && row[field.sourceColumn]) {
            let value = row[field.sourceColumn];
            if (field.transform) {
              value = field.transform(value);
            }
            transformed[field.targetField] = value;
          }
        });
        return transformed;
      });

      await onImport(transformedData, duplicateAction);
      
      toast({
        title: "Import successful",
        description: `${preview.validCount} candidates imported`,
      });
      
      handleClose();
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import candidates",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setHeaders([]);
    setData([]);
    setMapping(CANDIDATE_FIELDS);
    setPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Import Candidates</DialogTitle>
          <DialogDescription>
            {step === 'upload' && "Upload a CSV or Excel file containing candidate data"}
            {step === 'mapping' && "Map your file columns to candidate fields"}
            {step === 'preview' && "Review and confirm the import"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {step === 'upload' && (
            <div className="space-y-4 p-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span>Choose File</span>
                  </Button>
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Expected fields:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Name (required)</li>
                  <li>Email (required)</li>
                  <li>Phone</li>
                  <li>Location</li>
                  <li>Current Role</li>
                  <li>Experience (years)</li>
                  <li>Skills (comma-separated)</li>
                  <li>Status</li>
                  <li>Stage</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4 p-4">
              <p className="text-sm text-muted-foreground">
                Map columns from your file to candidate fields
              </p>
              
              {mapping.map((field) => (
                <div key={field.targetField} className="flex items-center gap-4">
                  <Label className="w-1/3 font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Select
                    value={field.sourceColumn || ""}
                    onValueChange={(value) => handleMappingChange(field.targetField, value)}
                  >
                    <SelectTrigger className="w-2/3">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {step === 'preview' && preview && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
                  <p className="text-2xl font-bold">{preview.validCount}</p>
                  <p className="text-sm text-muted-foreground">Valid rows</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mb-2" />
                  <p className="text-2xl font-bold">{preview.duplicateCount}</p>
                  <p className="text-sm text-muted-foreground">Duplicates</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 mb-2" />
                  <p className="text-2xl font-bold">{preview.errorCount}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              </div>

              {preview.duplicateCount > 0 && (
                <div className="space-y-2">
                  <Label>How should we handle duplicates?</Label>
                  <Select value={duplicateAction} onValueChange={(v: any) => setDuplicateAction(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip duplicates</SelectItem>
                      <SelectItem value="update">Update existing records</SelectItem>
                      <SelectItem value="create">Create as new records</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {preview.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Validation Errors:</p>
                  <ScrollArea className="h-32 border rounded-lg p-2">
                    {preview.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-600 mb-1">
                        Row {error.row + 2}: {error.errors.join(', ')}
                      </div>
                    ))}
                    {preview.errors.length > 10 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        And {preview.errors.length - 10} more errors...
                      </p>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          {step !== 'upload' && (
            <Button variant="outline" onClick={() => setStep(step === 'preview' ? 'mapping' : 'upload')}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'mapping' && (
            <Button onClick={handleGeneratePreview}>
              Preview Import
            </Button>
          )}
          {step === 'preview' && (
            <Button onClick={handleImport} disabled={isImporting || (preview?.validCount || 0) === 0}>
              {isImporting ? "Importing..." : `Import ${preview?.validCount || 0} Candidates`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
