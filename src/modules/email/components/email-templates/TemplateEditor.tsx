import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Copy,
  Eye,
  Save,
  AlertCircle,
  Info,
  Paperclip,
  X,
  Plus,
  File,
} from "lucide-react";
import {
  EmailTemplate,
  TEMPLATE_VARIABLES,
  extractVariablesFromTemplate,
  interpolateTemplate,
  templateSchema,
} from "@/shared/lib/emailTemplateService";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";
import { AIRewritePopover } from "./AIRewritePopover";
import { RichTextEditor } from "@/shared/components/ui/RichTextEditor";

interface TemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
  onSave: (data: any, changeNote?: string) => void;
}

export function TemplateEditor({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateEditorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(template?.name || '');
  const [type, setType] = useState(template?.type || 'CUSTOM');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [isDefault, setIsDefault] = useState(template?.isDefault ?? false);
  const [attachments, setAttachments] = useState<any[]>(template?.attachments || []);
  const [changeNote, setChangeNote] = useState('');
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  // Sync state with template prop changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setType(template.type);
      setSubject(template.subject);
      setBody(template.body);
      setIsActive(template.isActive);
      setIsDefault(template.isDefault);
      setAttachments(Array.isArray(template.attachments) ? template.attachments : []);
    } else {
      // Don't reset everything to allow keeping draft state if closed accidentally?
      // For now, simpler to just reset if opened with null
      if (open && !template) {
         // Optional: Reset logic if needed
      }
    }
  }, [template, open]);

  const usedVariables = extractVariablesFromTemplate(subject + ' ' + body);
  const availableVariables = TEMPLATE_VARIABLES.filter((v) => usedVariables.includes(v.key));

  const handleInsertVariable = (variable: string, field: 'subject' | 'body') => {
    const varString = `{{${variable}}}`;
    if (field === 'subject') {
      setSubject(subject + varString);
    } else {
      // For RichTextEditor, we append to HTML. 
      // Simple append might break HTML structure, but for now this is okay.
      // Better would be inserting at cursor, but that requires editor ref access.
      setBody(body + varString);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    // Simulate upload - in real app, upload to S3/Cloudinary here
    try {
      const newAttachments = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // Temporary URL for display/preview
        // In reality, this URL should be the response from the server
      }));

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAttachments([...attachments, ...newAttachments]);
      toast({
        title: "Files attached",
        description: `${files.length} file(s) added successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not attach files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    try {
      // Basic validation
      if (!name) throw new Error("Name is required");
      if (!subject) throw new Error("Subject is required");
      if (!body || body === '<p></p>') throw new Error("Body is required");

      onSave(
        {
          name,
          type,
          subject,
          body,
          variables: usedVariables,
          attachments,
          isActive,
          isDefault,
        },
        (template && template.id) ? changeNote || undefined : undefined
      );

      toast({
        title: "Template saved",
        description: template ? "Template updated successfully" : "New template created",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Validation error",
        description: error instanceof Error ? error.message : "Please check all fields",
        variant: "destructive",
      });
    }
  };

  // Generate preview data
  const getPreviewData = () => {
    const data: Record<string, string> = {};
    TEMPLATE_VARIABLES.forEach((v) => {
      data[v.key] = previewData[v.key] || v.example;
    });
    return data;
  };

  const previewSubject = interpolateTemplate(subject, getPreviewData());
  const previewBody = interpolateTemplate(body, getPreviewData());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl flex flex-col h-full bg-background p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-xl">
            {template && template.id ? 'Edit Template' : 'Create Email Template'}
          </SheetTitle>
          <SheetDescription>
            Design rich email templates with dynamic variables and attachments
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start h-12 bg-transparent p-0">
              <TabsTrigger 
                value="editor" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4"
              >
                Editor
              </TabsTrigger>
              <TabsTrigger 
                value="preview"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger 
                value="variables"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4"
              >
                Variables
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Template Details Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Interview Invitation - Technical Round"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Template Type *</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                    <SelectItem value="OFFER">Offered</SelectItem>
                    <SelectItem value="HIRED">Hired</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject Line Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="subject">Email Subject *</Label>
                <div className="flex gap-2">
                  <AIRewritePopover 
                    text={subject} 
                    field="subject" 
                    onRewrite={setSubject} 
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const vars = TEMPLATE_VARIABLES.slice(0, 3);
                      vars.forEach((v) => handleInsertVariable(v.key, 'subject'));
                    }}
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Insert Variables
                  </Button>
                </div>
              </div>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Interview Invitation - {{jobTitle}} at {{companyName}}"
                className="text-lg font-medium"
              />
            </div>

            {/* Body Editor Section */}
            <div className="space-y-2 flex-1 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Email Body *</Label>
                <div className="flex gap-2 items-center">
                  <AIRewritePopover 
                    text={body} 
                    field="body" 
                    onRewrite={setBody} 
                  />
                  {usedVariables.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {usedVariables.length} variables used
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex-1 border rounded-lg overflow-hidden bg-background">
                <RichTextEditor
                  content={body}
                  onChange={setBody}
                  placeholder="Write your email template here..."
                  className="h-full min-h-[350px] border-0"
                />
              </div>
            </div>
            
            {/* Attachments Section */}
            <div className="space-y-3 bg-muted/40 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments
                </Label>
                <span className="text-xs text-muted-foreground">
                  Max 5MB
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-background p-2 rounded-md border text-sm shadow-sm group">
                    <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                      <File className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-[100px] max-w-[200px]">
                      <span className="truncate font-medium leading-none">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <Button
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
                
                <div className="relative">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Add File'}
                  </Button>
                </div>
              </div>
            </div>

            {template && (
              <div className="space-y-2">
                <Label htmlFor="changeNote">Change Note (Optional)</Label>
                <Input
                  id="changeNote"
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="Describe what changed in this version"
                />
              </div>
            )}

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <div className="flex flex-col">
                  <Label htmlFor="isActive" className="cursor-pointer font-medium">Active Template</Label>
                  <span className="text-xs text-muted-foreground">Available for use in campaigns</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border">
                <Switch
                  id="isDefault"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
                <div className="flex flex-col">
                  <Label htmlFor="isDefault" className="cursor-pointer font-medium">Default Template</Label>
                  <span className="text-xs text-muted-foreground">Used as standard for this type</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto p-6 space-y-4">
            <Card className="h-full flex flex-col border-0 shadow-none bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Email Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="bg-background rounded-lg border shadow-sm p-4 space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Subject</Label>
                    <div className="mt-1 font-semibold text-lg border-b pb-2">
                      {previewSubject || 'Subject will appear here'}
                    </div>
                  </div>

                  <div>
                     <div 
                      className="prose prose-sm max-w-none min-h-[200px]"
                      dangerouslySetInnerHTML={{ __html: previewBody || 'Email body will appear here' }}
                    />
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div>
                     <Label className="text-xs text-muted-foreground">Attachments ({attachments.length})</Label>
                     <div className="flex flex-wrap gap-2 mt-2">
                       {attachments.map((file, i) => (
                         <Badge key={i} variant="outline" className="flex items-center gap-2 py-1.5 px-3 bg-background">
                           <Paperclip className="h-3 w-3 text-muted-foreground" />
                           {file.name}
                         </Badge>
                       ))}
                     </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
             {/* Variable Inputs for Preview */}
             {availableVariables.length > 0 && (
              <div className="pt-4 border-t">
                 <h4 className="text-sm font-medium mb-3">Preview Data</h4>
                 <div className="grid grid-cols-2 gap-3">
                  {availableVariables.map((variable) => (
                    <div key={variable.key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{variable.label}</Label>
                      <Input
                        className="h-8"
                        placeholder={variable.example}
                        value={previewData[variable.key] || ''}
                        onChange={(e) =>
                          setPreviewData({ ...previewData, [variable.key]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                 </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="variables" className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-3">
              {TEMPLATE_VARIABLES.map((variable) => (
                <div
                  key={variable.key}
                  className={cn(
                    "flex flex-col p-4 border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer group",
                    usedVariables.includes(variable.key) && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                  )}
                  onClick={() => {
                    navigator.clipboard.writeText(`{{${variable.key}}}`);
                    toast({
                      title: "Copied!",
                      description: `{{${variable.key}}} copied to clipboard`,
                    });
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-semibold bg-muted px-2 py-0.5 rounded text-primary">
                      {`{{${variable.key}}}`}
                    </code>
                    <Badge variant="outline" className="text-[10px]">
                      {variable.category}
                    </Badge>
                  </div>
                  <div className="font-medium text-sm mb-1">{variable.label}</div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {variable.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed">
                    <span className="text-[10px] text-muted-foreground">
                      Example: {variable.example}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onSave({ ...template }, changeNote)}>
                Save Draft
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {template && template.id ? 'Save Changes' : 'Create Template'}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
