import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { List, Plus, X, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

interface ChatListBuilderCardProps {
    title: string;
    subtitle: string;
    items: string[];
    onChange: (items: string[]) => void;
    onContinue: () => void;
    isParsed?: boolean;
    placeholder?: string;
    minItems?: number;
    /** For AI Assist: generate list items using full context */
    onGenerateList?: (currentItems: string[]) => Promise<string[]>;
}

export const ChatListBuilderCard: React.FC<ChatListBuilderCardProps> = ({
    title,
    subtitle,
    items,
    onChange,
    onContinue,
    isParsed,
    placeholder = 'Add an item...',
    minItems = 1,
    onGenerateList,
}) => {
    const [newItem, setNewItem] = useState('');
    const [showAiSuggestion, setShowAiSuggestion] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string[] | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleAiAssist = async () => {
        if (!onGenerateList) return;
        setAiLoading(true);
        setAiError(null);
        setShowAiSuggestion(true);
        setAiSuggestion(null);
        try {
            const suggested = await onGenerateList(items);
            setAiSuggestion(Array.isArray(suggested) ? suggested : []);
        } catch (e) {
            setAiError(e instanceof Error ? e.message : 'Failed to generate suggestion');
        } finally {
            setAiLoading(false);
        }
    };

    const handleAddItem = () => {
        if (newItem.trim()) {
            onChange([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
        }
    };

    const canContinue = items.length >= minItems;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <List className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
                </div>
            </div>

            <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{items.length} items added</span>
                    <div className="flex items-center gap-2">
                        {isParsed && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                From JD
                            </Badge>
                        )}
                        {onGenerateList && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary gap-1"
                                onClick={handleAiAssist}
                                disabled={aiLoading}
                            >
                                {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                AI Assist
                            </Button>
                        )}
                    </div>
                </div>

                {/* AI Suggestion panel */}
                {showAiSuggestion && onGenerateList && (
                    <div className="p-3 bg-muted/30 border rounded-lg space-y-2 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> AI Suggestion
                            </span>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { setShowAiSuggestion(false); setAiError(null); }}>
                                <span className="sr-only">Dismiss</span>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        {aiLoading && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Generating using company and job context...
                            </p>
                        )}
                        {aiError && (
                            <p className="text-sm text-destructive">{aiError}</p>
                        )}
                        {!aiLoading && aiSuggestion && aiSuggestion.length > 0 && (
                            <>
                                <ul className="text-sm text-muted-foreground space-y-1 max-h-[180px] overflow-y-auto list-decimal list-inside">
                                    {aiSuggestion.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="flex-1 text-xs"
                                        onClick={() => {
                                            onChange(aiSuggestion);
                                            setShowAiSuggestion(false);
                                            setAiSuggestion(null);
                                        }}
                                    >
                                        Replace list
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs"
                                        onClick={() => {
                                            onChange([...items, ...aiSuggestion]);
                                            setShowAiSuggestion(false);
                                            setAiSuggestion(null);
                                        }}
                                    >
                                        Append to list
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Existing Items */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg group"
                        >
                            <span className="text-sm text-muted-foreground mt-0.5">{index + 1}.</span>
                            <span className="flex-1 text-sm">{item}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                onClick={() => handleRemoveItem(index)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Add New Item */}
                <div className="flex gap-2">
                    <Input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        className="flex-1"
                    />
                    <Button onClick={handleAddItem} disabled={!newItem.trim()} size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            <Button
                onClick={onContinue}
                disabled={!canContinue}
                className="w-full gap-2"
                size="lg"
            >
                Continue <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
