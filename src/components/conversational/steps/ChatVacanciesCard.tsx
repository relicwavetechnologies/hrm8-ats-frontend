import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { ChevronRight, Users, Minus, Plus } from 'lucide-react';

interface ChatVacanciesCardProps {
    value: number;
    onChange: (value: number) => void;
    onContinue: () => void;
}

export const ChatVacanciesCard: React.FC<ChatVacanciesCardProps> = ({
    value,
    onChange,
    onContinue,
}) => {
    const decrease = () => onChange(Math.max(1, value - 1));
    const increase = () => onChange(value + 1);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Counter UI */}
            <div className="flex flex-col items-center justify-center py-4 gap-6">
                <div className="flex items-center gap-6">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrease}
                        disabled={value <= 1}
                        className="h-12 w-12 rounded-full border-2 text-lg"
                    >
                        <Minus className="h-5 w-5" />
                    </Button>

                    <div className="flex flex-col items-center">
                        <span className="text-6xl font-bold tabular-nums leading-none text-foreground">{value}</span>
                        <span className="text-sm text-muted-foreground mt-2">{value === 1 ? 'position' : 'positions'}</span>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={increase}
                        className="h-12 w-12 rounded-full border-2 text-lg"
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>

                {/* Quick picks */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 5, 10].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange(n)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                                value === n
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground hover:border-primary/40'
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                    <span className="text-xs text-muted-foreground px-1">or</span>
                    <input
                        type="number"
                        value={value}
                        min={1}
                        onChange={(e) => {
                            const num = parseInt(e.target.value);
                            if (!isNaN(num) && num >= 1) onChange(num);
                        }}
                        className="h-7 w-16 text-center text-xs border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="other"
                    />
                </div>
            </div>

            <Button
                onClick={onContinue}
                className="w-full h-11 font-semibold rounded-lg"
            >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
};
