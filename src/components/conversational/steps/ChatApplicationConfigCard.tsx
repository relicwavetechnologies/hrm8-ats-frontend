import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { ArrowRight, Settings, FileText, Globe, Linkedin, Briefcase } from 'lucide-react';
import { ApplicationFormConfig } from '@/shared/types/applicationForm';

interface ChatApplicationConfigCardProps {
    config: ApplicationFormConfig;
    onChange: (config: ApplicationFormConfig) => void;
    onContinue: () => void;
}

export const ChatApplicationConfigCard: React.FC<ChatApplicationConfigCardProps> = ({
    config,
    onChange,
    onContinue,
}) => {
    const handleToggle = (field: 'resume' | 'coverLetter' | 'portfolio' | 'linkedIn' | 'website', type: 'included' | 'required') => {
        const current = config.includeStandardFields?.[field] || { included: false, required: false };
        const updated = { ...current, [type]: !current[type] };

        // If making required, ensure included is true
        if (type === 'required' && updated.required) {
            updated.included = true;
        }
        // If making not included, ensure required is false
        if (type === 'included' && !updated.included) {
            updated.required = false;
        }

        onChange({
            ...config,
            includeStandardFields: {
                ...config.includeStandardFields,
                [field]: updated,
            },
        });
    };

    const fields = [
        { id: 'resume', label: 'Resume / CV', icon: FileText },
        { id: 'coverLetter', label: 'Cover Letter', icon: FileText },
        { id: 'portfolio', label: 'Portfolio / Work Samples', icon: Briefcase },
        { id: 'linkedIn', label: 'LinkedIn Profile', icon: Linkedin },
        { id: 'website', label: 'Personal Website', icon: Globe },
    ] as const;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Application Configuration</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        Customize what information candidates need to provide.
                    </p>
                </div>
            </div>

            <Card className="p-0 overflow-hidden border-none shadow-sm">
                <div className="bg-muted/30 px-5 py-3 border-b flex justify-between items-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Field</span>
                    <div className="flex gap-8 px-2">
                        <span>Include</span>
                        <span>Require</span>
                    </div>
                </div>
                <div className="divide-y">
                    {fields.map((field) => {
                        const Icon = field.icon;
                        const state = config.includeStandardFields?.[field.id] || { included: false, required: false };

                        return (
                            <div key={field.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">{field.label}</span>
                                </div>
                                <div className="flex items-center gap-10">
                                    <Switch
                                        checked={state.included}
                                        onCheckedChange={() => handleToggle(field.id, 'included')}
                                    />
                                    <Switch
                                        checked={state.required}
                                        onCheckedChange={() => handleToggle(field.id, 'required')}
                                        disabled={!state.included}
                                        className="data-[state=checked]:bg-red-500"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Button onClick={onContinue} className="w-full gap-2" size="lg">
                Continue <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
