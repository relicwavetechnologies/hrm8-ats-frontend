import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useToast } from "@/shared/hooks/use-toast";
import { jobTemplateService } from "@/shared/lib/jobTemplateService";
import { Sparkles, Loader2, Check, AlertCircle, FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";

interface CreateTemplateWithAIDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateTemplateWithAIDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateTemplateWithAIDialogProps) {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedTemplate, setGeneratedTemplate] = useState<any>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({
                title: "Prompt required",
                description: "Please describe the job template you want to create.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        try {
            const response = await jobTemplateService.generateTemplateWithAI(prompt);
            if (response.success && response.data) {
                setGeneratedTemplate(response.data);
            } else {
                throw new Error(response.error || "Failed to generate template");
            }
        } catch (error: any) {
            toast({
                title: "Generation failed",
                description: error.message || "There was an error generating the template. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedTemplate) return;

        setIsSaving(true);
        try {
            const response = await jobTemplateService.createTemplate({
                name: generatedTemplate.name,
                description: generatedTemplate.description,
                category: generatedTemplate.category,
                isShared: true,
                jobData: generatedTemplate.jobData,
            });

            if (response.success) {
                toast({
                    title: "Template saved",
                    description: `"${generatedTemplate.name}" has been created successfully.`,
                });
                setGeneratedTemplate(null);
                setPrompt("");
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                throw new Error(response.error || "Failed to save template");
            }
        } catch (error: any) {
            toast({
                title: "Save failed",
                description: error.message || "There was an error saving the template.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setGeneratedTemplate(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        Create Template with AI
                    </DialogTitle>
                    <DialogDescription>
                        {generatedTemplate
                            ? "Review and customize the AI-generated template below"
                            : "Tell AI what kind of job template you need, and it will generate the title, description, requirements, and more."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-6 pt-2">
                    {!generatedTemplate ? (
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="prompt" className="text-base font-medium">Describe the Job</Label>
                                <Textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., Senior Frontend Engineer with 5+ years experience in React, TypeScript and Tailwind CSS. Should be able to lead a team and have good communication skills."
                                    className="min-h-[200px] text-base resize-none focus-visible:ring-primary/20"
                                />
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 pt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Be as specific or as general as you like. AI will handle the rest.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <Card className="bg-muted/30 border-none">
                                    <CardContent className="p-4 pt-4">
                                        <h4 className="text-sm font-semibold mb-2">Try prompts like:</h4>
                                        <ul className="text-xs space-y-2 text-muted-foreground">
                                            <li className="flex items-start gap-2 italic hover:text-foreground cursor-pointer transition-colors" onClick={() => setPrompt("Product Manager for a fintech startup, focused on user growth and data analytics")}>
                                                <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                                                "Product Manager for a fintech startup..."
                                            </li>
                                            <li className="flex items-start gap-2 italic hover:text-foreground cursor-pointer transition-colors" onClick={() => setPrompt("Junior HR Specialist for an international company. Remote work available.")}>
                                                <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                                                "Junior HR Specialist for an international company..."
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card className="bg-primary/5 border-none">
                                    <CardContent className="p-4 pt-4">
                                        <h4 className="text-sm font-semibold mb-2">AI will generate:</h4>
                                        <ul className="text-xs space-y-2 text-muted-foreground">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-3 w-3 text-green-500" />
                                                Professional Job Description
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-3 w-3 text-green-500" />
                                                Structured Requirements & Responsibilities
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-3 w-3 text-green-500" />
                                                Optimal Category & Employment Type
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4 pb-4">
                            <div className="space-y-6 py-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-foreground">{generatedTemplate.name}</h3>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="capitalize">
                                                {generatedTemplate.category.toLowerCase().replace('_', ' ')}
                                            </Badge>
                                            <Badge variant="outline" className="capitalize">{generatedTemplate.jobData.employmentType.replace('-', ' ')}</Badge>
                                            <Badge variant="outline" className="capitalize">{generatedTemplate.jobData.experienceLevel}</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                                        Try Again
                                    </Button>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-1 text-muted-foreground uppercase tracking-wider">Template Goal</h4>
                                        <p className="text-sm">{generatedTemplate.description}</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-bold mb-2">{generatedTemplate.jobData.title}</h3>
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                            <p>{generatedTemplate.jobData.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <Check className="h-4 w-4 text-green-500" />
                                                Requirements
                                            </h4>
                                            <ul className="space-y-2">
                                                {generatedTemplate.jobData.requirements.map((req: string, i: number) => (
                                                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                                        <span className="text-primary mt-1">•</span>
                                                        {req}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary" />
                                                Responsibilities
                                            </h4>
                                            <ul className="space-y-2">
                                                {generatedTemplate.jobData.responsibilities.map((resp: string, i: number) => (
                                                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                                        <span className="text-primary mt-1">•</span>
                                                        {resp}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="p-6 border-t mt-auto">
                    {!generatedTemplate ? (
                        <div className="flex w-full gap-3">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                                disabled={isGenerating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                className="flex-1 gap-2"
                                disabled={isGenerating || !prompt.trim()}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Generate Template
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full gap-3">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="flex-1"
                                disabled={isSaving}
                            >
                                Back to Prompt
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="flex-1 gap-2"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Save Template
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
