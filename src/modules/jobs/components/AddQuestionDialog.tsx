import { useState, useEffect } from "react";
import { ApplicationQuestion, QuestionType, QuestionOption } from "@/shared/types/applicationForm";
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
import { Switch } from "@/shared/components/ui/switch";
import { Plus, X, GripVertical } from "lucide-react";
import { questionTypeIcons, questionTypeLabels, needsOptions } from "@/shared/lib/applicationFormUtils";

interface AddQuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (question: ApplicationQuestion) => void;
    editQuestion?: ApplicationQuestion | null;
    nextOrder: number;
}

export function AddQuestionDialog({
    open,
    onOpenChange,
    onAdd,
    editQuestion,
    nextOrder,
}: AddQuestionDialogProps) {
    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<QuestionType>("short_text");
    const [required, setRequired] = useState(true);
    const [options, setOptions] = useState<QuestionOption[]>([]);

    // Initialize form when editing or opening
    useEffect(() => {
        if (editQuestion) {
            setLabel(editQuestion.label);
            setDescription(editQuestion.description || "");
            setType(editQuestion.type);
            setRequired(editQuestion.required);
            setOptions(editQuestion.options || []);
        } else {
            setLabel("");
            setDescription("");
            setType("short_text");
            setRequired(true);
            setOptions([]);
        }
    }, [editQuestion, open]);

    // Add default options if type needs them and none exist
    useEffect(() => {
        if (needsOptions(type) && options.length === 0) {
            setOptions([
                { id: "opt-1", label: "Option 1", value: "option_1" },
                { id: "opt-2", label: "Option 2", value: "option_2" },
            ]);
        }
    }, [type]);

    const handleAddOption = () => {
        const newId = `opt-${Date.now()}`;
        setOptions([
            ...options,
            { id: newId, label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` },
        ]);
    };

    const handleRemoveOption = (id: string) => {
        setOptions(options.filter((o) => o.id !== id));
    };

    const handleUpdateOption = (id: string, label: string) => {
        setOptions(
            options.map((o) =>
                o.id === id ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, "_") } : o
            )
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!label.trim()) return;

        const question: ApplicationQuestion = {
            id: editQuestion?.id || `question-${Date.now()}`,
            label: label.trim(),
            description: description.trim() || undefined,
            type,
            required,
            options: needsOptions(type) ? options : undefined,
            order: editQuestion?.order || nextOrder,
        };

        onAdd(question);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editQuestion ? "Edit Question" : "Create New Question"}</DialogTitle>
                        <DialogDescription>
                            Add a screening question to your application form to filter candidates.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        {/* Question Label */}
                        <div className="space-y-2">
                            <Label htmlFor="label">Question Text *</Label>
                            <Input
                                id="label"
                                placeholder="e.g., How many years of experience do you have in React?"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                required
                                className="text-base"
                            />
                        </div>

                        {/* Question Type */}
                        <div className="space-y-2">
                            <Label htmlFor="type">Question Type</Label>
                            <Select value={type} onValueChange={(v: QuestionType) => setType(v)}>
                                <SelectTrigger id="type" className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(questionTypeLabels).map(([key, label]) => {
                                        const Icon = questionTypeIcons[key as QuestionType];
                                        return (
                                            <SelectItem key={key} value={key}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    <span>{label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Help Text / Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Give candidates more context on how to answer..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                            />
                        </div>

                        {/* Options Management */}
                        {needsOptions(type) && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <Label>Options</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleAddOption}
                                        className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Option
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {options.map((option, index) => (
                                        <div key={option.id} className="flex items-center gap-2 group">
                                            <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <Input
                                                value={option.label}
                                                onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveOption(option.id)}
                                                disabled={options.length <= 1}
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Required Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t mt-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="required">Required Question</Label>
                                <p className="text-sm text-muted-foreground">
                                    Candidates must answer this question to submit their application.
                                </p>
                            </div>
                            <Switch
                                id="required"
                                checked={required}
                                onCheckedChange={setRequired}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!label.trim()}>
                            {editQuestion ? "Save Changes" : "Add Question"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
