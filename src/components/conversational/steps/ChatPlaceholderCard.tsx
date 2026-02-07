import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { FileText, List, Users, Calendar, Check, CreditCard, ArrowRight, Settings, HelpCircle } from 'lucide-react';

interface ChatPlaceholderCardProps {
    stepId: string;
    stepTitle: string;
    description?: string;
    onContinue: () => void;
    onSkip?: () => void;
}

const stepIcons: Record<string, React.ElementType> = {
    'description': FileText,
    'requirements': List,
    'responsibilities': List,
    'application-config': Settings,
    'screening-questions': HelpCircle,
    'hiring-team': Users,
    'logistics': Calendar,
    'review': Check,
    'payment': CreditCard,
};

const stepDescriptions: Record<string, string> = {
    'description': 'Add a compelling job description to attract the best candidates.',
    'requirements': 'List the key requirements for this role.',
    'responsibilities': 'Outline the main responsibilities of this position.',
    'application-config': 'Configure what information candidates should provide.',
    'screening-questions': 'Add custom screening questions for candidates.',
    'hiring-team': 'Add team members who will be involved in hiring.',
    'logistics': 'Set the application deadline and visibility settings.',
    'review': 'Review all the details before publishing your job post.',
    'payment': 'Complete payment to publish your job listing.',
};

const stepTitles: Record<string, string> = {
    'description': 'Job Description',
    'requirements': 'Requirements',
    'responsibilities': 'Responsibilities',
    'application-config': 'Application Settings',
    'screening-questions': 'Screening Questions',
    'hiring-team': 'Hiring Team',
    'logistics': 'Close Date & Visibility',
    'review': 'Review & Submit',
    'payment': 'Payment',
};

export const ChatPlaceholderCard: React.FC<ChatPlaceholderCardProps> = ({
    stepId,
    stepTitle,
    description,
    onContinue,
    onSkip,
}) => {
    const Icon = stepIcons[stepId] || FileText;
    const desc = description || stepDescriptions[stepId] || 'Complete this step to continue.';
    const title = stepTitle || stepTitles[stepId] || 'Next Step';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <Card className="p-8 border-2 border-dashed border-muted-foreground/30 bg-muted/10">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-muted-foreground">{desc}</p>
                    <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2 inline-block">
                        ⚠️ This step is coming soon. Click continue to skip for now.
                    </p>
                </div>
            </Card>

            <div className="flex gap-3 pt-2">
                {onSkip && (
                    <Button variant="ghost" onClick={onSkip} className="flex-1">
                        Skip
                    </Button>
                )}
                <Button onClick={onContinue} className="flex-1 gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export { stepTitles, stepDescriptions };
