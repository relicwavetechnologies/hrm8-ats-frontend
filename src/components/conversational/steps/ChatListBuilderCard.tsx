import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { List, Plus, X, ArrowRight, Sparkles } from 'lucide-react';

interface ChatListBuilderCardProps {
    title: string;
    subtitle: string;
    items: string[];
    onChange: (items: string[]) => void;
    onContinue: () => void;
    isParsed?: boolean;
    placeholder?: string;
    minItems?: number;
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
}) => {
    const [newItem, setNewItem] = useState('');

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
                    {isParsed && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            From JD
                        </Badge>
                    )}
                </div>

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
