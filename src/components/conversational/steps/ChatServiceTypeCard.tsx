import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Briefcase, Users, Star, Check, Crown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

interface ChatServiceTypeCardProps {
    onSelect: (value: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search') => void;
    currentValue?: string;
}

const services = [
    {
        id: 'self-managed' as const,
        name: 'Self-Managed',
        price: 'FREE',
        description: 'Post and manage the entire hiring process yourself.',
        features: ['Post to job board', 'Track all applications', 'Full ATS access'],
        icon: Briefcase,
        recommended: false,
    },
    {
        id: 'shortlisting' as const,
        name: 'Shortlisting Service',
        price: '$1,990',
        description: 'We screen candidates and send you a curated shortlist.',
        features: ['Multi-channel advertising', 'Applicant screening', 'Shortlist delivered'],
        icon: Users,
        recommended: true,
    },
    {
        id: 'full-service' as const,
        name: 'Full Service Recruitment',
        price: '$5,990',
        description: 'Complete, end-to-end recruitment assistance.',
        features: ['Dedicated recruiter', 'Interview coordination', 'Offer negotiation'],
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
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-base text-muted-foreground px-1 mb-2">
                Let's start by choosing how you'd like to handle this hire:
            </p>
            <div className="flex flex-col gap-3">
                {services.map((service) => {
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
                                    <Star className="h-3 w-3 mr-1 fill-white" />
                                    POPULAR
                                </Badge>
                            )}

                            <div className="flex items-center gap-4">
                                {/* Icon */}
                                <div className={cn(
                                    "p-3 rounded-xl transition-all duration-300",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10"
                                )}>
                                    <Icon className="h-6 w-6" />
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between">
                                        <h4 className="font-semibold text-base">{service.name}</h4>
                                        <span className="text-lg font-bold text-primary">{service.price}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{service.description}</p>

                                    {/* Features (collapsed by default, shown on hover or selection) */}
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

                                {/* Selection Indicator */}
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
    );
};
