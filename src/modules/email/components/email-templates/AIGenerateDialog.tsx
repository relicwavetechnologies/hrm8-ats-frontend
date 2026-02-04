
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { useToast } from "@/shared/hooks/use-toast";

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (template: { subject: string; body: string }) => void;
}

export function AIGenerateDialog({
  open,
  onOpenChange,
  onGenerate,
}: AIGenerateDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [type, setType] = useState("INTERVIEW");
  const [tone, setTone] = useState("professional");
  const [context, setContext] = useState("");

  const handleGenerate = async () => {
    if (!jobTitle) {
      toast({
        title: "Missing fields",
        description: "Please enter a job title/position.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<{ success: boolean; subject: string; body: string }>(
        "/api/ai/templates/generate",
        {
          type,
          jobTitle,
          tone,
          context,
          // Defaults
          companyName: "Our Company", 
          candidateName: "Candidate"
        }
      );

      if (res.success && res.data) {
        onGenerate({ subject: res.data.subject, body: res.data.body });
        onOpenChange(false);
        // Reset specific fields but keep others for quick re-use if needed
        setContext("");
      } else {
        toast({
          title: "Generation failed",
          description: "Could not generate template. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while communicating with AI.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate with AI
          </DialogTitle>
          <DialogDescription>
            Describe what you need, and our AI will draft a professional email template for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Template Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
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

          <div className="grid gap-2">
            <Label htmlFor="jobTitle">Job Position / Subject Focus</Label>
            <Input
              id="jobTitle"
              placeholder="e.g. Senior Frontend Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tone">Tone of Voice</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional & Formal</SelectItem>
                <SelectItem value="friendly">Friendly & Casual</SelectItem>
                <SelectItem value="excited">Excited & Energetic</SelectItem>
                <SelectItem value="direct">Direct & Concise</SelectItem>
                <SelectItem value="empathetic">Empathetic (Good for rejections)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g. Mention that this is a remote role, or that we were impressed by their portfolio."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
