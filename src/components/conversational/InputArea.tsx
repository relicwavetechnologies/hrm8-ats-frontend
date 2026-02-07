import React, { useState, KeyboardEvent, useRef } from 'react';
import { Send, PlusCircle, Paperclip } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';

interface InputAreaProps {
    onSend: (message: string) => void;
    onFileUpload: (file: File) => void;
    disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, onFileUpload, disabled }) => {
    const [input, setInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSend(input);
            setInput('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative group">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
            />
            <div className="flex items-end gap-3 rounded-[24px] bg-muted/40 p-2.5 transition-all focus-within:bg-muted/60 focus-within:ring-2 focus-within:ring-primary/20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full h-11 w-11 text-muted-foreground hover:bg-white/50 hover:text-primary transition-all"
                >
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer here..."
                    className="flex-1 min-h-[44px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 resize-none py-3 text-base font-medium placeholder:text-muted-foreground/60 transition-all"
                    disabled={disabled}
                />
                <Button
                    onClick={handleSend}
                    disabled={!input.trim() || disabled}
                    className={cn(
                        "rounded-2xl h-11 px-5 shadow-sm transition-all duration-300",
                        input.trim() ? "bg-primary hover:bg-primary/90 scale-100" : "bg-muted-foreground/20 scale-95 opacity-50"
                    )}
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
            <div className="mt-2 pl-14 flex items-center gap-2 text-[11px] text-muted-foreground/50 font-bold uppercase tracking-widest">
                <span>Shift + Enter for new line</span>
            </div>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
