import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Briefcase, Users, Star, Check, Crown, Sparkles, UserCheck } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ChatServiceTypeCardProps {
    onSelect: (value: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search') => void;
    currentValue?: string;
}

const managedServices = [
    {
        id: 'shortlisting' as const,
        name: 'Shortlisting Service',
        price: '$1,990',
        description: 'We screen candidates and send you a curated shortlist.',
        features: ['Candidate screening', 'Curated shortlist', 'Fast turnaround'],
        icon: Users,
        recommended: true,
    },
    {
        id: 'full-service' as const,
        name: 'Full Service Recruitment',
        price: '$5,990',
        description: 'Complete, end-to-end recruitment assistance.',
        features: ['Sourcing and screening', 'Interview coordination', 'Offer closure support'],
        icon: Star,
        recommended: false,
    },
    {
        id: 'executive-search' as const,
        name: 'Executive Search',
        price: 'Custom',
        description: 'Confidential search for senior and C-level roles.',
        features: ['Headhunting', 'Executive assessment', 'Board-level expertise'],
        icon: Crown,
        recommended: false,
    },
];

export const ChatServiceTypeCard: React.FC<ChatServiceTypeCardProps> = ({ onSelect, currentValue }) => {
    const selectedGroup =
        currentValue === 'self-managed' || currentValue === 'rpo' ? 'self-managed' : 'hrm8-managed';

    const selectGroup = (group: 'self-managed' | 'hrm8-managed') => {
        if (group === 'self-managed') {
            onSelect('self-managed');
            return;
        }
        if (currentValue === 'shortlisting' || currentValue === 'full-service' || currentValue === 'executive-search') {
            onSelect(currentValue);
            return;
        }
        onSelect('shortlisting');
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-base text-muted-foreground px-1 mb-2">
                Choose hiring mode first, then select a managed service if needed:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card
                    className={cn(
                        "relative cursor-pointer transition-all duration-300 p-5 hover:shadow-lg",
                        selectedGroup === 'self-managed'
                            ? "border-2 border-primary bg-primary/5 shadow-lg"
                            : "border hover:border-primary/50"
                    )}
                    onClick={() => selectGroup('self-managed')}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-xl transition-all duration-300",
                            selectedGroup === 'self-managed' ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                                <h4 className="font-semibold text-base">Self-Managed</h4>
                                <span className="text-lg font-bold text-primary">FREE</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                Publish and manage the entire hiring process yourself.
                            </p>
                        </div>
                        <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            selectedGroup === 'self-managed' ? "bg-primary border-primary" : "border-muted-foreground/30"
                        )}>
                            {selectedGroup === 'self-managed' && <Check className="h-4 w-4 text-primary-foreground" />}
                        </div>
                    </div>
                </Card>

                <Card
                    className={cn(
                        "relative cursor-pointer transition-all duration-300 p-5 hover:shadow-lg",
                        selectedGroup === 'hrm8-managed'
                            ? "border-2 border-primary bg-primary/5 shadow-lg"
                            : "border hover:border-primary/50"
                    )}
                    onClick={() => selectGroup('hrm8-managed')}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-xl transition-all duration-300",
                            selectedGroup === 'hrm8-managed' ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                                <h4 className="font-semibold text-base">HRM8 Managed</h4>
                                <span className="text-lg font-bold text-primary">Wallet Based</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                Consultants handle delivery after the job is posted and OPEN.
                            </p>
                        </div>
                        <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            selectedGroup === 'hrm8-managed' ? "bg-primary border-primary" : "border-muted-foreground/30"
                        )}>
                            {selectedGroup === 'hrm8-managed' && <Check className="h-4 w-4 text-primary-foreground" />}
                        </div>
                    </div>
                </Card>
            </div>

            {selectedGroup === 'hrm8-managed' && (
                <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                        Select HRM8 Managed Service
                    </p>
                    <div className="flex flex-col gap-3">
                        {managedServices.map((service) => {
                            const Icon = service.icon;
                            const isSelected = currentValue === service.id;

                            return (
                                <Card
                                    key={service.id}
                                    className={cn(
                                        "relative cursor-pointer transition-all duration-300 p-5 hover:shadow-lg group",
                                        isSelected
                                            ? "border-2 border-primary bg-primary/5 shadow-lg"
                                            : "border hover:border-primary/50 hover:scale-[1.01]"
                                    )}
                                    onClick={() => onSelect(service.id)}
                                >
                                    {service.recommended && (
                                        <Badge
                                            className="absolute -top-2.5 -right-2.5 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2.5 py-0.5"
                                        >
                                            <Sparkles className="h-3 w-3 mr-1 fill-white" />
                                            POPULAR
                                        </Badge>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-xl transition-all duration-300",
                                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10"
                                        )}>
                                            <Icon className="h-6 w-6" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-baseline justify-between">
                                                <h4 className="font-semibold text-base">{service.name}</h4>
                                                <span className="text-lg font-bold text-primary">{service.price}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{service.description}</p>

                                            <div className={cn(
                                                "flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground transition-all duration-300",
                                                isSelected ? "opacity-100 max-h-20" : "opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20"
                                            )}>
                                                {service.features.map((f, i) => (
                                                    <span key={i} className="flex items-center gap-1">
                                                        <Check className="h-3 w-3 text-green-500" /> {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                        )}>
                                            {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
