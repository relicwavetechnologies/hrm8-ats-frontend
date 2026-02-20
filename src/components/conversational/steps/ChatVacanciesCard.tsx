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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Number of Vacancies
                </Label>
                <p className="text-xs text-muted-foreground">
                    How many positions are you looking to fill?
                </p>
            </div>

            <div className="flex items-center justify-center gap-3 py-2">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={decrease}
                    disabled={value <= 1}
                    className="h-10 w-10 rounded-full"
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <div className="relative w-20">
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const num = parseInt(e.target.value);
                            if (!isNaN(num) && num >= 1) onChange(num);
                        }}
                        className="h-12 text-center text-2xl font-bold rounded-md"
                        min={1}
                    />
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={increase}
                    className="h-10 w-10 rounded-full"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <Button
                onClick={onContinue}
                className="w-full h-10 text-sm rounded-md font-medium transition-all"
            >
                Continue <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
        </div>
    );
};
