import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { HelpCircle, Plus, X, ArrowRight, Sparkles } from 'lucide-react';

interface Question {
    id: string;
    text: string;
}

interface ChatScreeningQuestionsCardProps {
    questions: Question[];
    onChange: (questions: Question[]) => void;
    onContinue: () => void;
}

export const ChatScreeningQuestionsCard: React.FC<ChatScreeningQuestionsCardProps> = ({
    questions,
    onChange,
    onContinue,
}) => {
    const [newQuestion, setNewQuestion] = useState('');
    const [suggestions, setSuggestions] = useState([
        "How many years of experience do you have in this field?",
        "Are you authorized to work in this location?",
        "What is your expected salary range?",
        "When is the earliest you can start?",
    ]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            onChange([...questions, { id: Date.now().toString(), text: newQuestion.trim() }]);
            setNewQuestion('');
        }
    };

    const handleRemoveQuestion = (id: string) => {
        onChange(questions.filter((q) => q.id !== id));
    };

    const handleAddSuggested = (text: string) => {
        onChange([...questions, { id: Date.now().toString(), text }]);
    };

    const handleAiSuggest = () => {
        setIsGenerating(true);
        // Simulate AI generation delay
        setTimeout(() => {
            const newSuggestions = [
                "Describe a challenging project you worked on.",
                "Do you have experience with React and TypeScript?",
                "What are your salary expectations?",
                "Why do you want to join our team?",
            ];
            // Add unique new suggestions
            setSuggestions(prev => [...new Set([...prev, ...newSuggestions])]);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Screening Questions</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        Ask candidates specific questions when they apply.
                    </p>
                </div>
            </div>

            <Card className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{questions.length} questions added</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary gap-1"
                        onClick={handleAiSuggest}
                        disabled={isGenerating}
                    >
                        <Sparkles className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Generating...' : 'AI Suggest'}
                    </Button>
                </div>

                {/* Existing Questions */}
                {questions.length > 0 ? (
                    <div className="space-y-3">
                        {questions.map((q, index) => (
                            <Card key={q.id} className="p-3 bg-muted/30 flex gap-3 items-start group">
                                <span className="text-sm font-medium text-muted-foreground mt-0.5">Q{index + 1}.</span>
                                <p className="text-sm flex-1">{q.text}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                    onClick={() => handleRemoveQuestion(q.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                        <p className="text-sm">No screening questions added yet.</p>
                    </div>
                )}

                {/* Add New */}
                <div className="flex gap-2 pt-2">
                    <Input
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Type a question..."
                        onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                    />
                    <Button onClick={handleAddQuestion} disabled={!newQuestion.trim()}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Quick Add</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.filter(sq => !questions.some(q => q.text === sq)).map(sq => (
                            <Badge
                                key={sq}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary/5 hover:border-primary hover:text-primary transition-colors py-1.5 px-3"
                                onClick={() => handleAddSuggested(sq)}
                            >
                                + {sq}
                            </Badge>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="flex gap-3">
                <Button variant="ghost" onClick={onContinue} className="flex-1">
                    Skip
                </Button>
                <Button onClick={onContinue} className="flex-1 gap-2" size="lg">
                    Continue <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
