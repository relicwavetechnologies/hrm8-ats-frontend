import { create } from 'zustand';
import { HiringTeamMember, JobRole } from '@/shared/types/job';
import { JobRound } from '@/shared/lib/jobRoundService';

interface JobSetupState {
    managementType: 'self-managed' | 'hrm8-managed' | null;
    setupType: 'simple' | 'advanced' | null;
    roles: JobRole[];
    team: HiringTeamMember[];
    rounds: JobRound[];
    currentStep: number;
    isOpen: boolean;
    jobId: string | null;

    // Actions
    setIsOpen: (isOpen: boolean, jobId?: string | null) => void;
    setManagementType: (type: 'self-managed' | 'hrm8-managed') => void;
    setSetupType: (type: 'simple' | 'advanced') => void;
    setRoles: (roles: JobRole[]) => void;
    addRole: (role: JobRole) => void;
    setTeam: (team: HiringTeamMember[]) => void;
    updateMemberRoles: (memberId: string, roles: string[]) => void;
    setRounds: (rounds: JobRound[]) => void;
    addRound: (round: Partial<JobRound>) => void;
    updateRound: (index: number, updates: Partial<JobRound>) => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
}

export const useJobSetupStore = create<JobSetupState>((set) => ({
    managementType: null,
    setupType: null,
    roles: [
        { id: 'hiring_manager', name: 'Hiring Manager', isDefault: true },
        { id: 'recruiter', name: 'Recruiter', isDefault: true },
        { id: 'interviewer', name: 'Interviewer', isDefault: true },
    ],
    team: [],
    rounds: [],
    currentStep: 1,
    isOpen: false,
    jobId: null,

    setIsOpen: (isOpen, jobId = null) => set({ isOpen, jobId }),
    setManagementType: (managementType) => set({ managementType }),
    setSetupType: (setupType) => set({ setupType }),
    setRoles: (roles) => set({ roles }),
    addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
    setTeam: (team) => set({ team }),
    updateMemberRoles: (memberId, roles) =>
        set((state) => ({
            team: state.team.map((m) => m.id === memberId ? { ...m, roles } : m)
        })),
    setRounds: (rounds) => set({ rounds }),
    addRound: (round) => set((state) => ({
        rounds: [...state.rounds, { ...round, order: state.rounds.length + 1 } as JobRound]
    })),
    updateRound: (index, updates) =>
        set((state) => ({
            rounds: state.rounds.map((r, i) => i === index ? { ...r, ...updates } : r)
        })),
    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
    reset: () => set({
        managementType: null,
        setupType: null,
        roles: [
            { id: 'hiring_manager', name: 'Hiring Manager', isDefault: true },
            { id: 'recruiter', name: 'Recruiter', isDefault: true },
            { id: 'interviewer', name: 'Interviewer', isDefault: true },
        ],
        team: [],
        rounds: [],
        currentStep: 1,
        isOpen: false,
        jobId: null,
    }),
}));
