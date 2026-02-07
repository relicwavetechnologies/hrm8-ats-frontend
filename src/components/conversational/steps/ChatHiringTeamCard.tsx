import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Users, Plus, X, ArrowRight, Mail } from 'lucide-react';
import { HiringTeamMember } from '@/shared/types/job';

interface ChatHiringTeamCardProps {
    teamMembers: HiringTeamMember[];
    onChange: (members: HiringTeamMember[]) => void;
    onContinue: () => void;
}

export const ChatHiringTeamCard: React.FC<ChatHiringTeamCardProps> = ({
    teamMembers,
    onChange,
    onContinue,
}) => {
    const [newEmail, setNewEmail] = useState('');

    const handleAddMember = () => {
        if (newEmail.trim() && newEmail.includes('@')) {
            const newMember: HiringTeamMember = {
                id: Date.now().toString(),
                email: newEmail,
                name: newEmail.split('@')[0], // Placeholder name
                role: 'member',
                status: 'pending_invite',
                permissions: {
                    canViewApplications: true,
                    canShortlist: false,
                    canScheduleInterviews: false,
                    canMakeOffers: false
                }
            };
            onChange([...teamMembers, newMember]);
            setNewEmail('');
        }
    };

    const handleRemoveMember = (id: string) => {
        onChange(teamMembers.filter((m) => m.id !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Hiring Team</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        Invite colleagues to help review applications and interview candidates.
                    </p>
                </div>
            </div>

            <Card className="p-5 space-y-6">
                {/* Team List */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="/avatars/01.png" />
                            <AvatarFallback>YOU</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm font-medium">You (Admin)</p>
                            <p className="text-xs text-muted-foreground">Job Creator</p>
                        </div>
                    </div>

                    {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border group relative">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{member.email}</p>
                                <p className="text-xs text-muted-foreground capitalize">{member.role} • {member.status.replace('_', ' ')}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
                                onClick={() => handleRemoveMember(member.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Add Member */}
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Invite by Email</p>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="colleague@company.com"
                                className="pl-9"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                            />
                        </div>
                        <Button onClick={handleAddMember} disabled={!newEmail.includes('@')}>
                            Invite
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="flex gap-3">
                {teamMembers.length === 0 && (
                    <Button variant="ghost" onClick={onContinue} className="flex-1">
                        Skip
                    </Button>
                )}
                <Button onClick={onContinue} className="flex-1 gap-2" size="lg">
                    Continue <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
