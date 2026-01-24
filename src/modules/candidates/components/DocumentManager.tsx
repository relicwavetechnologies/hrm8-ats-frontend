import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { DocumentUploader } from './DocumentUploader';
import { DocumentViewer } from './DocumentViewer';
import {
  getCandidateDocuments,
  deleteDocument,
  downloadDocument,
  getStorageQuota,
} from '@/shared/lib/mockDocumentStorage';
import { CandidateDocument } from '@/shared/types/entities';
import { FileText, Download, Eye, Trash2, Upload, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Progress } from '@/shared/components/ui/progress';

const DOC_TYPE_LABELS = {
  resume: 'Resume',
  cover_letter: 'Cover Letter',
  certificate: 'Certificate',
  portfolio: 'Portfolio',
  other: 'Other',
};

const DOC_TYPE_COLORS = {
  resume: 'bg-primary',
  cover_letter: 'bg-accent',
  certificate: 'bg-success',
  portfolio: 'bg-purple',
  other: 'bg-secondary',
};

interface DocumentManagerProps {
  candidateId: string;
}

export function DocumentManager({ candidateId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState(getCandidateDocuments(candidateId));
  const [isUploading, setIsUploading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<CandidateDocument | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const quota = getStorageQuota();

  const refreshDocuments = () => {
    setDocuments(getCandidateDocuments(candidateId));
  };

  const handleDelete = (docId: string) => {
    deleteDocument(docId);
    refreshDocuments();
    setDeleteDocId(null);
    toast.success('Document deleted');
  };

  const handleDownload = (doc: CandidateDocument) => {
    downloadDocument(doc);
    toast.success('Document downloaded');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Storage Quota */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Storage Used</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatFileSize(quota.used)} / {formatFileSize(quota.total)}
          </span>
        </div>
        <Progress value={quota.percentage} className="h-2" />
      </Card>

      {/* Upload Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Documents</h3>
          <Button onClick={() => setIsUploading(!isUploading)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>

        {isUploading && (
          <DocumentUploader
            candidateId={candidateId}
            onUploadComplete={() => {
              refreshDocuments();
              setIsUploading(false);
            }}
            onCancel={() => setIsUploading(false)}
          />
        )}
      </Card>

      {/* Documents List */}
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Documents"
          description="Upload documents to keep all candidate files organized"
          action={{ label: 'Upload Document', onClick: () => setIsUploading(true) }}
        />
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${DOC_TYPE_COLORS[doc.documentType]}`}>
                  <FileText className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{doc.fileName}</h4>
                    <Badge variant="secondary">{DOC_TYPE_LABELS[doc.documentType]}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>Uploaded by {doc.uploadedBy}</span>
                    <span>•</span>
                    <span>{format(doc.uploadedAt, 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewingDocument(doc)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteDocId(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDocId} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This document will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDocId && handleDelete(deleteDocId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}