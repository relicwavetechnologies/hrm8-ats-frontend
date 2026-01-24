import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { FileUpload } from '@/shared/components/ui/file-upload';
import { uploadDocument } from '@/shared/lib/mockDocumentStorage';
import { CandidateDocument } from '@/shared/types/entities';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploaderProps {
  candidateId: string;
  onUploadComplete: () => void;
  onCancel: () => void;
}

export function DocumentUploader({ 
  candidateId, 
  onUploadComplete, 
  onCancel 
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<CandidateDocument['documentType']>('other');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadDocument(candidateId, file, documentType, 'Current User')
      );

      const results = await Promise.all(uploadPromises);
      const failed = results.filter((r) => !r.success);

      if (failed.length === 0) {
        toast.success(`${files.length} document(s) uploaded successfully`);
        onUploadComplete();
      } else {
        toast.error(`${failed.length} document(s) failed to upload: ${failed[0].error}`);
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
      <div>
        <label className="text-sm font-medium mb-2 block">Document Type</label>
        <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="resume">Resume</SelectItem>
            <SelectItem value="cover_letter">Cover Letter</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
            <SelectItem value="portfolio">Portfolio</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <FileUpload
        onFilesSelected={setFiles}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        maxFiles={5}
        maxSize={10 * 1024 * 1024}
        multiple
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </div>
    </div>
  );
}