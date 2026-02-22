import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tag, Plus, X, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Predefined standard tags for quick selection
const STANDARD_TAGS = [
    'Urgent',
    'Remote',
    'High Priority',
    'Entry Level',
    'Senior',
    'Contract',
    'Confidential'
];

interface ChatTagsCardProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    onContinue: () => void;
}

export const ChatTagsCard: React.FC<ChatTagsCardProps> = ({
    tags,
    onChange,
    onContinue,
}) => {
    const [newTag, setNewTag] = useState('');

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            onChange([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleToggleTag = (tag: string) => {
        if (tags.includes(tag)) {
            onChange(tags.filter(t => t !== tag));
        } else {
            onChange([...tags, tag]);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Tag className="h-4 w-4 text-foreground" />
                </div>
                <div>
                    <h3 className="text-base font-semibold">Tags</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Add tags to help organize and filter this job.
                    </p>
                </div>
            </div>

            <Card className="p-3.5 space-y-3 rounded-md shadow-none border">
                {/* Standard Tags */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Tags</p>
                    <div className="flex flex-wrap gap-2">
                        {STANDARD_TAGS.map(tag => (
                            <Badge
                                key={tag}
                                variant={tags.includes(tag) ? "default" : "outline"}
                                className={cn(
                                    "cursor-pointer transition-all h-6 px-2.5 text-[11px]",
                                    tags.includes(tag)
                                        ? "bg-foreground text-background hover:bg-foreground/90"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => handleToggleTag(tag)}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Custom Tags */}
                <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom Tags</p>

                    {/* Active Custom Tags (those not in standard list) */}
                    {tags.filter(t => !STANDARD_TAGS.includes(t)).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {tags.filter(t => !STANDARD_TAGS.includes(t)).map(tag => (
                                <Badge key={tag} variant="secondary" className="gap-1 h-6 px-2 text-[11px]">
                                    {tag}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggleTag(tag)}
                                        className="ml-1 h-4 w-4 p-0 rounded-full hover:bg-muted-foreground/20"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a custom tag..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            className="h-10"
                        />
                        <Button onClick={handleAddTag} disabled={!newTag.trim()} size="sm" className="h-10 px-3">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            <Button onClick={onContinue} className="w-full h-10 text-sm rounded-md font-medium gap-1.5">
                Continue <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
