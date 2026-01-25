import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
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
  const [name, setName] = useState(template?.name || '');
  const [type, setType] = useState(template?.type || 'custom');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [isDefault, setIsDefault] = useState(template?.isDefault ?? false);
  const [changeNote, setChangeNote] = useState('');
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  const usedVariables = extractVariablesFromTemplate(subject + ' ' + body);
  const availableVariables = TEMPLATE_VARIABLES.filter((v) => usedVariables.includes(v.key));

  const handleInsertVariable = (variable: string, field: 'subject' | 'body') => {
    const varString = `{{${variable}}}`;
    if (field === 'subject') {
      setSubject(subject + varString);
    } else {
      setBody(body + varString);
    }
  };

  const handleSave = () => {
    try {
      templateSchema.parse({
        name,
        type,
        subject,
        body,
        isActive,
        isDefault,
      });

      onSave(
        {
          name,
          type,
          subject,
          body,
          variables: usedVariables,
          isActive,
          isDefault,
        },
        template ? changeNote || undefined : undefined
      );

      toast({
        title: "Template saved",
        description: template ? "Template updated successfully" : "New template created",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Validation error",
        description: "Please check all required fields",
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create Email Template'}
          </DialogTitle>
          <DialogDescription>
            Design email templates with dynamic variables for automated communications
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="flex-1 overflow-y-auto mt-4 space-y-4">
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
                    <SelectItem value="application_confirmation">Application Confirmation</SelectItem>
                    <SelectItem value="interview_invitation">Interview Invitation</SelectItem>
                    <SelectItem value="offer_letter">Offer Letter</SelectItem>
                    <SelectItem value="rejection">Rejection</SelectItem>
                    <SelectItem value="stage_change">Stage Change</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="subject">Email Subject *</Label>
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
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Interview Invitation - {{jobTitle}} at {{companyName}}"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{'}{'{'} variableName {'}'}{'}'}  for dynamic content
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Email Body *</Label>
                <div className="flex gap-2">
                  {usedVariables.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {usedVariables.length} variables used
                    </Badge>
                  )}
                </div>
              </div>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email template here... Use {{variableName}} for dynamic content."
                rows={16}
                className="font-mono text-sm"
              />
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

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isDefault"
                    checked={isDefault}
                    onCheckedChange={setIsDefault}
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">Default Template</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Email Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <div className="mt-1 p-3 bg-muted rounded border font-semibold">
                    {previewSubject || 'Subject will appear here'}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Body</Label>
                  <div className="mt-1 p-4 bg-muted rounded border whitespace-pre-wrap">
                    {previewBody || 'Email body will appear here'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {availableVariables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customize Preview Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {availableVariables.map((variable) => (
                    <div key={variable.key} className="space-y-1">
                      <Label className="text-sm">{variable.label}</Label>
                      <Input
                        placeholder={variable.example}
                        value={previewData[variable.key] || ''}
                        onChange={(e) =>
                          setPreviewData({ ...previewData, [variable.key]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="variables" className="flex-1 overflow-y-auto mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Variables</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click to copy variable syntax
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {TEMPLATE_VARIABLES.map((variable) => (
                      <div
                        key={variable.key}
                        className={cn(
                          "p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                          usedVariables.includes(variable.key) && "border-primary bg-primary/5"
                        )}
                        onClick={() => {
                          navigator.clipboard.writeText(`{{${variable.key}}}`);
                          toast({
                            title: "Copied!",
                            description: `{{${variable.key}}} copied to clipboard`,
                          });
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium text-sm">{variable.label}</div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {`{{${variable.key}}}`}
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                          {variable.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Example:</span> {variable.example}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
