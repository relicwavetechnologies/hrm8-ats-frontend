
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Wand2, Loader2, Check, RefreshCw, X, Sparkles } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

interface AIRewritePopoverProps {
  text: string;
  field: "subject" | "body";
  onRewrite: (newText: string) => void;
}

export function AIRewritePopover({
  text,
  field,
  onRewrite,
}: AIRewritePopoverProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [tone, setTone] = useState("professional");
  const [rewrittenText, setRewrittenText] = useState("");

  const handleRewrite = async () => {
    if (!text || !instruction) return;

    setLoading(true);
    try {
      const res = await apiClient.post<{ success: boolean; text: string }>(
        "/api/ai/templates/rewrite",
        {
          text,
          field,
          instruction,
          tone,
        }
      );

      if (res.success && res.data) {
        setRewrittenText(res.data.text);
      } else {
        toast({
          title: "Rewrite failed",
          description: "Could not rewrite text. Please try again.",
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

  const handleAccept = () => {
    onRewrite(rewrittenText);
    setOpen(false);
    setRewrittenText("");
    setInstruction("");
  };

  const presetInstructions = field === 'subject' 
    ? [
        "Make it punchier",
        "Shorten it",
        "Make it urgent",
        "Make it friendly",
        "Optimize for open rate"
      ] 
    : [
        "Simplify the language",
        "Make it more empathetic",
        "Shorten this paragraph",
        "Fix grammar and tone",
        "Make it more persuasive"
      ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
          title="Rewrite with AI"
        >
          <Wand2 className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-purple-500" />
              Rewrite {field === "subject" ? "Subject" : "Content"}
            </h4>
            <p className="text-xs text-muted-foreground">
              Select an instruction or type your own to refine this text.
            </p>
          </div>

          {!rewrittenText ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {presetInstructions.map((inst) => (
                  <Button
                    key={inst}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setInstruction(inst)}
                  >
                    {inst}
                  </Button>
                ))}
              </div>

              <div className="grid gap-2">
                 <div className="flex gap-2">
                     <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                           <SelectValue placeholder="Tone" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="professional">Professional</SelectItem>
                           <SelectItem value="friendly">Friendly</SelectItem>
                           <SelectItem value="direct">Direct</SelectItem>
                           <SelectItem value="confident">Confident</SelectItem>
                        </SelectContent>
                     </Select>
                 </div>
                <Textarea
                  placeholder={`E.g. "Make it formatted as a list" or "Translate to Spanish"`}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="h-20 text-sm resize-none"
                />
              </div>

              <Button 
                onClick={handleRewrite} 
                disabled={loading || !instruction} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3 w-3" />
                    Generate Rewrite
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-muted p-3 rounded-md text-sm border relative">
                  <div className="absolute -top-2 left-2 bg-background px-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                     Rewritten
                  </div>
                  {rewrittenText}
               </div>
               
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setRewrittenText("")}>
                     <RefreshCw className="mr-2 h-3 w-3" />
                     Try Again
                  </Button>
                  <Button variant="default" size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAccept}>
                     <Check className="mr-2 h-3 w-3" />
                     Accept
                  </Button>
               </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Importing Sparkles icon which was missed in import list
// Adding it to imports in the next step or ensuring it's available.
// Actually lucide-react exports Sparkles so it should be fine if imported above.
