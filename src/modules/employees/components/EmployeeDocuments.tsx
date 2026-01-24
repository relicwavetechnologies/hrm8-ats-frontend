import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Plus, FileText, Download, Trash2, Calendar } from "lucide-react";
import { EmployeeDocument, EmployeeDocumentType } from "@/shared/types/employee";
import { getEmployeeDocuments, addEmployeeDocument, deleteEmployeeDocument } from "@/shared/lib/employeeStorage";
import { format } from "date-fns";
import { toast } from "sonner";

interface EmployeeDocumentsProps {
  employeeId: string;
}

const DOCUMENT_TYPES: { value: EmployeeDocumentType; label: string }[] = [
  { value: "contract", label: "Contract" },
  { value: "identification", label: "Identification" },
  { value: "certification", label: "Certification" },
  { value: "tax-form", label: "Tax Form" },
  { value: "visa", label: "Visa" },
  { value: "license", label: "License" },
  { value: "policy-acknowledgment", label: "Policy Acknowledgment" },
  { value: "performance-review", label: "Performance Review" },
  { value: "resume", label: "Resume" },
  { value: "other", label: "Other" },
];

export function EmployeeDocuments({ employeeId }: EmployeeDocumentsProps) {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "other" as EmployeeDocumentType,
    description: "",
    expiryDate: "",
  });

  useEffect(() => {
    loadDocuments();
  }, [employeeId]);

  const loadDocuments = () => {
    const docs = getEmployeeDocuments(employeeId);
    setDocuments(docs);
  };

  const handleUpload = async () => {
    if (!formData.name) {
      toast.error("Please enter a document name");
      return;
    }

    setUploading(true);
    try {
      const newDocument: EmployeeDocument = {
        id: `doc-${Date.now()}`,
        employeeId,
        name: formData.name,
        type: formData.type,
        description: formData.description || undefined,
        fileUrl: "#", // Placeholder - in real app would handle file upload
        fileSize: 0,
        mimeType: "application/pdf",
        version: 1,
        uploadedBy: "current-user",
        uploadedAt: new Date().toISOString(),
        expiryDate: formData.expiryDate || undefined,
        status: "active",
      };

      addEmployeeDocument(newDocument);
      loadDocuments();
      setUploadDialogOpen(false);
      setFormData({ name: "", type: "other", description: "", expiryDate: "" });
      toast.success("Document uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteEmployeeDocument(documentId);
      loadDocuments();
      toast.success("Document deleted successfully");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      expired: "destructive",
      archived: "secondary",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Manage employee documents and files</CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{doc.type.replace('-', ' ')}</span>
                        <span>•</span>
                        <span>Uploaded {format(new Date(doc.uploadedAt), "MMM d, yyyy")}</span>
                        {doc.expiryDate && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires {format(new Date(doc.expiryDate), "MMM d, yyyy")}
                            </span>
                          </>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground truncate">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(doc.status)}
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Add a new document for this employee</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="doc-name">Document Name</Label>
              <Input
                id="doc-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Employment Contract 2024"
              />
            </div>
            <div>
              <Label htmlFor="doc-type">Document Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as EmployeeDocumentType })}
              >
                <SelectTrigger id="doc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="doc-description">Description (Optional)</Label>
              <Input
                id="doc-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the document"
              />
            </div>
            <div>
              <Label htmlFor="doc-expiry">Expiry Date (Optional)</Label>
              <Input
                id="doc-expiry"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
