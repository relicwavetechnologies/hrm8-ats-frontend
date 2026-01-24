import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Upload, CheckCircle2, XCircle, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { getEmployees, saveEmployee } from '@/shared/lib/employeeStorage';
import JSZip from 'jszip';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';

interface BulkPhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PhotoMatch {
  employeeId: string;
  employeeName: string;
  fileName: string;
  photoData: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export function BulkPhotoUploadDialog({ open, onOpenChange, onSuccess }: BulkPhotoUploadDialogProps) {
  const [photoMatches, setPhotoMatches] = useState<PhotoMatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast.error('Please select a ZIP file');
      return;
    }

    setIsProcessing(true);

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const employees = getEmployees();
      const matches: PhotoMatch[] = [];

      // Process each file in the ZIP
      for (const [filename, fileData] of Object.entries(zipContent.files)) {
        if (fileData.dir) continue;

        // Check if it's an image
        const ext = filename.toLowerCase().split('.').pop();
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
          continue;
        }

        // Extract employee ID from filename (e.g., "EMP001.jpg" -> "EMP001")
        const employeeId = filename.split('.')[0].split('/').pop() || '';
        
        // Find matching employee
        const employee = employees.find(emp => 
          emp.employeeId.toLowerCase() === employeeId.toLowerCase()
        );

        if (employee) {
          // Convert image to base64
          const blob = await fileData.async('blob');
          const reader = new FileReader();
          
          await new Promise((resolve) => {
            reader.onload = () => {
              matches.push({
                employeeId: employee.employeeId,
                employeeName: `${employee.firstName} ${employee.lastName}`,
                fileName: filename,
                photoData: reader.result as string,
                status: 'pending',
              });
              resolve(null);
            };
            reader.readAsDataURL(blob);
          });
        }
      }

      if (matches.length === 0) {
        toast.error('No matching employees found. Name files with Employee IDs (e.g., EMP001.jpg)');
      } else {
        setPhotoMatches(matches);
        toast.success(`Found ${matches.length} photo matches`);
      }
    } catch (error) {
      console.error('ZIP processing error:', error);
      toast.error('Failed to process ZIP file');
    } finally {
      setIsProcessing(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleUpload = async () => {
    if (photoMatches.length === 0) {
      toast.error('No photos to upload');
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    const updatedMatches = [...photoMatches];
    const employees = getEmployees();

    for (let i = 0; i < updatedMatches.length; i++) {
      const match = updatedMatches[i];
      
      try {
        const employee = employees.find(emp => emp.employeeId === match.employeeId);
        if (!employee) {
          match.status = 'error';
          match.error = 'Employee not found';
          errorCount++;
          continue;
        }

        // Update employee with photo
        employee.avatar = match.photoData;
        saveEmployee(employee);
        
        match.status = 'success';
        successCount++;
      } catch (error) {
        match.status = 'error';
        match.error = error instanceof Error ? error.message : 'Failed to save photo';
        errorCount++;
      }

      // Update UI every 5 records or at the end
      if (i % 5 === 0 || i === updatedMatches.length - 1) {
        setPhotoMatches([...updatedMatches]);
      }
    }

    setIsUploading(false);

    if (errorCount === 0) {
      toast.success(`Successfully uploaded ${successCount} photos!`);
      onSuccess();
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } else {
      toast.warning(`Uploaded ${successCount} photos. ${errorCount} failed.`);
    }
  };

  const handleClose = () => {
    setPhotoMatches([]);
    onOpenChange(false);
  };

  const successCount = photoMatches.filter(m => m.status === 'success').length;
  const errorCount = photoMatches.filter(m => m.status === 'error').length;
  const pendingCount = photoMatches.filter(m => m.status === 'pending').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Bulk Photo Upload
          </DialogTitle>
          <DialogDescription>
            Upload multiple employee photos at once using a ZIP file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Photo naming format:</p>
              <p className="text-sm">Name each photo with the Employee ID (e.g., EMP001.jpg, EMP002.png)</p>
              <p className="text-sm mt-1">Supported formats: JPG, PNG, GIF, WEBP</p>
            </AlertDescription>
          </Alert>

          {photoMatches.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="zip-upload"
                accept=".zip"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <label htmlFor="zip-upload" className="cursor-pointer">
                {isProcessing ? (
                  <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                ) : (
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                )}
                <p className="text-lg font-medium mb-2">
                  {isProcessing ? 'Processing ZIP file...' : 'Click to upload ZIP file'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Select a ZIP file containing employee photos
                </p>
              </label>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                    Pending: {pendingCount}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Success: {successCount}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    Errors: {errorCount}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhotoMatches([])}
                  disabled={isUploading}
                >
                  Clear
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="p-4 space-y-2">
                  {photoMatches.map((match, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        match.status === 'success'
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                          : match.status === 'error'
                          ? 'bg-destructive/10 border-destructive/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={match.photoData} alt={match.employeeName} />
                        <AvatarFallback>
                          {match.employeeId.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{match.employeeName}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {match.employeeId} • {match.fileName}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {match.status === 'success' && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                            {match.status === 'error' && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            {match.status === 'pending' && (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                            )}
                          </div>
                        </div>
                        {match.error && (
                          <p className="text-sm text-destructive mt-1">{match.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Close
          </Button>
          {photoMatches.length > 0 && pendingCount > 0 && (
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {photoMatches.length} Photo{photoMatches.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
