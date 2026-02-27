import { useState, useEffect, useCallback } from 'react';
import { documentHubService, CompanyDocument, DOCUMENT_CATEGORIES } from '@/shared/lib/documentHubService';
import { useToast } from '@/shared/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import {
  Upload, Search, Trash2, Download, FileText, FolderOpen, Loader2, Plus, File, FileSpreadsheet, FileImage,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const FILE_ICONS: Record<string, any> = {
  'application/pdf': FileText,
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'image/png': FileImage,
  'image/jpeg': FileImage,
  'image/webp': FileImage,
};

function formatFileSize(bytes?: number) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentHub() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [uploadCategory, setUploadCategory] = useState('OTHER');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentHubService.getDocuments({ search: search || undefined, category });
      if (res.success && res.data) {
        setDocuments(res.data.documents);
        setTotal(res.data.total);
      }
    } catch {
      toast({ title: 'Failed to load documents', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const res = await documentHubService.uploadDocument(file, { category: uploadCategory });
        if (!res.success) throw new Error(res.error || 'Upload failed');
      }
      toast({ title: `${files.length} document${files.length > 1 ? 's' : ''} uploaded` });
      fetchDocuments();
    } catch (error) {
      toast({ title: 'Upload failed', description: error instanceof Error ? error.message : 'Please try again', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await documentHubService.deleteDocument(id);
      if (!res.success) throw new Error(res.error || 'Delete failed');
      toast({ title: 'Document deleted' });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setTotal((prev) => prev - 1);
    } catch (error) {
      toast({ title: 'Delete failed', description: error instanceof Error ? error.message : 'Please try again', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (doc: CompanyDocument) => {
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const url = doc.fileUrl.startsWith('http') ? doc.fileUrl : `${apiBase}${doc.fileUrl}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Documents Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload and manage company documents — NDA, offer letters, contracts, policies, and more.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={uploadCategory} onValueChange={setUploadCategory}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORIES.filter((c) => c.value !== 'ALL').map((c) => (
                <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="inline-flex">
            <input type="file" className="hidden" multiple onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
            <Button size="sm" className="h-9" asChild disabled={uploading}>
              <span>
                {uploading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
                {uploading ? 'Uploading...' : 'Upload Document'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-none border-border/80">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="pl-8 h-9 text-sm"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">{total} document{total !== 1 ? 's' : ''}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="shadow-none border-border/80">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-sm font-semibold">Company Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="h-9 text-[11px]">Document</TableHead>
                <TableHead className="h-9 text-[11px]">Category</TableHead>
                <TableHead className="h-9 text-[11px]">Size</TableHead>
                <TableHead className="h-9 text-[11px]">Uploaded</TableHead>
                <TableHead className="h-9 text-[11px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell colSpan={5} className="h-12">
                      <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FolderOpen className="h-10 w-10 opacity-30" />
                      <p className="text-sm">No documents yet</p>
                      <p className="text-xs">Upload your first document to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => {
                  const IconComponent = FILE_ICONS[doc.mimeType || ''] || File;
                  return (
                    <TableRow key={doc.id} className="border-b border-border/60">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{doc.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{doc.fileName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                          {DOCUMENT_CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDownload(doc)} title="Download">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(doc.id)}
                            disabled={deletingId === doc.id}
                            title="Delete"
                          >
                            {deletingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
