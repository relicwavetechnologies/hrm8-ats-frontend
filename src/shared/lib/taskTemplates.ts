export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  type: string;
}

export const taskTemplates: TaskTemplate[] = [
  {
    id: 'request-references',
    title: 'Request References',
    description: 'Contact candidate for professional references',
    priority: 'HIGH',
    type: 'Reference Check',
  },
  {
    id: 'schedule-next-round',
    title: 'Schedule Next Round',
    description: 'Schedule the next interview round with hiring team',
    priority: 'MEDIUM',
    type: 'Follow-up',
  },
  {
    id: 'verify-documents',
    title: 'Verify Documents',
    description: 'Review and verify submitted documents (resume, certifications, etc.)',
    priority: 'MEDIUM',
    type: 'Document Review',
  },
  {
    id: 'send-offer-letter',
    title: 'Send Offer Letter',
    description: 'Prepare and send formal offer letter to candidate',
    priority: 'URGENT',
    type: 'Offer',
  },
  {
    id: 'background-check',
    title: 'Initiate Background Check',
    description: 'Start background verification process',
    priority: 'HIGH',
    type: 'Background Check',
  },
  {
    id: 'follow-up-email',
    title: 'Send Follow-up Email',
    description: 'Send a follow-up email to candidate',
    priority: 'LOW',
    type: 'Follow-up',
  },
];

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'LOW':
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
    case 'MEDIUM':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-700 border-orange-200';
    case 'URGENT':
      return 'bg-red-500/10 text-red-700 border-red-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-purple-500/10 text-purple-700 border-purple-200';
    case 'COMPLETED':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'CANCELLED':
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}
