
import { useState, useEffect } from "react";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { jobRoundService, JobRound } from "@/shared/lib/jobRoundService";
import { emailTemplateService, EmailTemplate, EmailTemplateType } from "@/shared/lib/emailTemplateService";
import { toast } from "sonner";
import { Save, AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface RoundEmailConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  round: JobRound | null;
  onSuccess?: () => void;
}

export function RoundEmailConfigDrawer({
  open,
  onOpenChange,
  jobId,
  round,
  onSuccess,
}: RoundEmailConfigDrawerProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Config State
  const [enabled, setEnabled] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  // Data State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    if (open && jobId && round) {
      loadData();
    }
  }, [open, jobId, round]);

  useEffect(() => {
    if (selectedTemplateId) {
      const found = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(found || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedTemplateId, templates]);

  const getExpectedTemplateType = (roundType: string, fixedKey?: string | null): EmailTemplateType | undefined => {
    if (fixedKey === 'NEW') return 'NEW';
    if (fixedKey === 'OFFER') return 'OFFER'; 
    if (fixedKey === 'HIRED') return 'HIRED';
    if (fixedKey === 'REJECTED') return 'REJECTED';
    
    if (roundType === 'ASSESSMENT') return 'ASSESSMENT';
    if (roundType === 'INTERVIEW') return 'INTERVIEW'; // Simplified from INTERVIEW_INVITATION
    
    return undefined;
  };

  const formatTemplateTypeLabel = (type: string | undefined) => {
    if (!type) return 'Unknown';
    switch (type) {
        case 'NEW': return 'New Application';
        case 'APPLICATION_CONFIRMATION': return 'New Application'; // Fallback
        case 'ASSESSMENT': return 'Assessment';
        case 'INTERVIEW': return 'Interview';
        case 'INTERVIEW_INVITATION': return 'Interview'; // Map legacy to simple
        case 'OFFER': return 'Offer';
        case 'HIRED': return 'Hired';
        case 'REJECTED': return 'Rejected';
        default:
            return type.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (!round) return;

      // 1. Load Config
      const configRes = await jobRoundService.getEmailConfig(jobId, round.id);
      if (configRes.success && configRes.data) {
        setEnabled(configRes.data.enabled);
        setSelectedTemplateId(configRes.data.templateId || "");
      } else {
        setEnabled(false);
        setSelectedTemplateId("");
      }

      // 2. Load Templates
      // 2. Load Templates
      const expectedType = getExpectedTemplateType(round.type, round.fixedKey);
      
      // Fetch specific templates if type is known
      const specificTemplatesPromise = expectedType 
        ? emailTemplateService.getTemplates({ type: expectedType }) 
        : Promise.resolve([]);

      // Always fetch CUSTOM templates
      const customTemplatesPromise = emailTemplateService.getTemplates({ type: 'CUSTOM' });

      const [specificTemplates, customTemplates] = await Promise.all([
        specificTemplatesPromise, 
        customTemplatesPromise
      ]);
      
      // Combine and deduplicate by ID
      const allTemplates = [...specificTemplates, ...customTemplates];
      // Deduplicate by ID
      const uniqueTemplates = Array.from(new Map(allTemplates.map(t => [t.id, t])).values());
      
      setTemplates(uniqueTemplates);

    } catch (error) {
      console.error("Failed to load email config:", error);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    toast.info("Please create a template in the Email Hub first.");
  };

  const handleSave = async () => {
    if (!round) return;

    // Validation: Template required if enabled
    if (enabled && !selectedTemplateId) {
        toast.error("Please select an email template or disable the automation.");
        return;
    }

    setSaving(true);
    try {
        // Frontend Validation for Assessment URL
        if (enabled && round.type === 'ASSESSMENT') {
           if (selectedTemplate && !selectedTemplate.body.includes('{{assessmentUrl}}') && !selectedTemplate.body.includes('{{assessment_url}}')) {
             toast.error("Assessment templates must include the {{assessmentUrl}} variable.");
             setSaving(false);
             return;
           }
        }

        const response = await jobRoundService.updateEmailConfig(jobId, round.id, {
            enabled,
            templateId: selectedTemplateId
        });

        if (response.success) {
            toast.success("Email configuration saved");
            onSuccess?.();
            onOpenChange(false);
        } else {
            throw new Error(response.error || "Failed to save");
        }
    } catch (error) {
        console.error("Failed to save config:", error);
        toast.error("Failed to save configuration");
    } finally {
        setSaving(false);
    }
  };

  if (!round) return null;

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Email Configuration: ${round.name}`}
      description="Configure automated emails for this stage"
      width="xl"
    >
      {loading ? (
        <div className="flex justify-center p-8">Loading...</div>
      ) : (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <CardTitle className="text-base">Automated Email</CardTitle>
                            <CardDescription>
                                Send an email when a candidate moves to this stage
                            </CardDescription>
                        </div>
                        <Switch
                            checked={enabled}
                            onCheckedChange={setEnabled}
                        />
                    </div>
                </CardHeader>
               {enabled && (
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Template</Label>
                        <div className="flex gap-2">
                            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Choose a template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>
                                            <span className="flex items-center justify-between w-full gap-2">
                                                <span>{t.name}</span>
                                                <span className="text-xs text-muted-foreground opacity-70">
                                                    {formatTemplateTypeLabel(t.type)}
                                                </span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" onClick={handleCreateTemplate} title="Create New Template">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Showing <strong>{formatTemplateTypeLabel(getExpectedTemplateType(round.type, round.fixedKey))}</strong> and <strong>Custom</strong> templates.
                        </p>
                    </div>

                    {selectedTemplate && (
                        <div className="mt-4 p-4 border rounded-md bg-muted/30">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Preview</Label>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">{selectedTemplate.subject}</p>
                                <div className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                                    {selectedTemplate.body}
                                </div>
                            </div>
                        </div>
                    )}

                    {round.type === 'ASSESSMENT' && selectedTemplate && !selectedTemplate.body.includes('{{assessmentUrl}}') && (
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Invalid Template</AlertTitle>
                            <AlertDescription>
                            This template is missing the required <strong>{'{{assessmentUrl}}'}</strong> variable. Please edit the template in Email Hub.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
               )}
            </Card>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                </Button>
            </div>
        </div>
      )}
    </FormDrawer>
  );
}
