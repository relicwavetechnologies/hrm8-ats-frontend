import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { CandidateDocument } from '@/shared/types/entities';
import { Download, X, Edit3, Eye } from 'lucide-react';
import { downloadDocument } from '@/shared/lib/mockDocumentStorage';
import { ResumeAnnotator } from './resume/ResumeAnnotator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';

interface DocumentViewerProps {
  document: CandidateDocument;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const isPDF = document.fileName.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(document.fileName);
  const [viewMode, setViewMode] = useState<'preview' | 'annotate'>('preview');

  // Determine if annotation is supported (requires parsed content)
  const isAnnotatable = !!document.content;

  // Mock current user info - in a real app this would come from auth context
  const currentUser = {
    id: 'current-user-id',
    name: 'Current User'
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{document.fileName}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadDocument(document)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isAnnotatable ? (
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'preview' | 'annotate')} className="flex-1 flex flex-col">
            <div className="flex justify-center border-b px-4">
              <TabsList>
                <TabsTrigger value="preview">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="annotate">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Annotate
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="preview" className="flex-1 overflow-hidden mt-0">
               <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
                {isImage ? (
                  <img
                    src={document.fileUrl}
                    alt={document.fileName}
                    className="w-full h-full object-contain"
                  />
                ) : isPDF ? (
                  <iframe
                    src={document.fileUrl}
                    className="w-full h-full"
                    title={document.fileName}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-center p-8">
                    <div>
                      <p className="text-muted-foreground mb-4">
                        Preview not available for this file type
                      </p>
                      <Button onClick={() => downloadDocument(document)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download to View
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="annotate" className="flex-1 overflow-hidden mt-0">
              <ResumeAnnotator 
                resumeId={document.id}
                content={document.content || ''}
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 overflow-auto bg-muted rounded-lg">
            {isImage ? (
              <img
                src={document.fileUrl}
                alt={document.fileName}
                className="w-full h-full object-contain"
              />
            ) : isPDF ? (
              <iframe
                src={document.fileUrl}
                className="w-full h-full"
                title={document.fileName}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <p className="text-muted-foreground mb-4">
                    Preview not available for this file type
                  </p>
                  <Button onClick={() => downloadDocument(document)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}