import { WizardStepId } from '@/modules/jobs/store/useJobCreateStore';

export interface Message {
    id: string;
    role: 'bot' | 'user';
    content: string;
    timestamp: Date;
    stepId?: WizardStepId; // Optional: associated with a specific wizard step
    type?: 'text' | 'choice' | 'salary' | 'location' | 'list' | 'rich-text' | 'review' | 'payment';
    options?: string[]; // For choice-based questions
}

export interface ConversationState {
    messages: Message[];
    isTyping: boolean;
}
