import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { getEmployeeDocuments } from "@/shared/lib/employeeStorage";
import { FileText, Download, Trash2, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { EmployeeDocumentType } from "@/shared/types/employee";

interface EmployeeDocumentsTabProps {
  employeeId: string;
}

export function EmployeeDocumentsTab({ employeeId }: EmployeeDocumentsTabProps) {
  const documents = getEmployeeDocuments(employeeId);

  const getDocumentTypeLabel = (type: EmployeeDocumentType): string => {
    const labels: Record<EmployeeDocumentType, string> = {
      'contract': 'Contract',
      'identification': 'Identification',
      'certification': 'Certification',
      'tax-form': 'Tax Form',
      'visa': 'Visa',
      'license': 'License',
      'policy-acknowledgment': 'Policy Acknowledgment',
      'performance-review': 'Performance Review',
      'resume': 'Resume',
      'other': 'Other',
    };
    return labels[type];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Documents</h3>
          <p className="text-sm text-muted-foreground">
            Manage employee documents and contracts
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{document.name}</h4>
                      <Badge variant="outline">{getDocumentTypeLabel(document.type)}</Badge>
                      {document.status === 'expired' && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                    {document.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Version {document.version}</span>
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span>Uploaded {format(new Date(document.uploadedAt), "MMM d, yyyy")}</span>
                    </div>
                    {document.expiryDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {format(new Date(document.expiryDate), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    {document.tags && document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {document.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {documents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload documents to get started
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload First Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
