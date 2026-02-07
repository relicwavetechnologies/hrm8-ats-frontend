import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { ChevronRight, Users, Minus, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Number of Vacancies
                </Label>
                <p className="text-sm text-muted-foreground">
                    How many positions are you looking to fill?
                </p>
            </div>

            <div className="flex items-center justify-center gap-4 py-6">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={decrease}
                    disabled={value <= 1}
                    className="h-12 w-12 rounded-full"
                >
                    <Minus className="h-5 w-5" />
                </Button>

                <div className="relative w-24">
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const num = parseInt(e.target.value);
                            if (!isNaN(num) && num >= 1) onChange(num);
                        }}
                        className="h-16 text-center text-3xl font-bold rounded-xl"
                        min={1}
                    />
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={increase}
                    className="h-12 w-12 rounded-full"
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            <Button
                onClick={onContinue}
                className="w-full h-12 text-base rounded-xl font-semibold transition-all"
            >
                Continue <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
    );
};
