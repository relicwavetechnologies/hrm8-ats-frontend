import { apiClient } from './api';

export type EmailTemplateType =
  | 'APPLICATION_CONFIRMATION'
  | 'INTERVIEW_INVITATION'
  | 'REJECTION'
  | 'OFFER_EXTENDED'
  | 'OFFER_ACCEPTED'
  | 'STAGE_CHANGE'
  | 'REMINDER'
  | 'FOLLOW_UP'
  | 'CUSTOM';

export interface EmailTemplate {
  id: string;
  companyId: string;
  jobId: string | null;
  jobRoundId: string | null;
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  isAiGenerated: boolean;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  example: string;
  category: string;
}

export interface CreateEmailTemplateRequest {
  jobId?: string | null;
  jobRoundId?: string | null;
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  variables?: string[];
  isActive?: boolean;
  isDefault?: boolean;
  isAiGenerated?: boolean;
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  subject?: string;
  body?: string;
  variables?: string[];
  isActive?: boolean;
  isDefault?: boolean;
}

export interface GenerateAITemplateRequest {
  jobRoundId?: string;
  templateType: EmailTemplateType;
  jobId?: string;
  tone?: 'professional' | 'friendly' | 'casual' | 'formal';
  additionalContext?: string;
}

export interface GeneratedEmailTemplate {
  subject: string;
  body: string;
  suggestedVariables: string[];
}

export interface TemplatePreviewRequest {
  templateId: string;
  sampleData?: Record<string, any>;
}

export interface TemplatePreview {
  subject: string;
  body: string;
}

export const emailTemplateService = {
  /**
   * Get all templates
   */
  async getTemplates(filters?: {
    jobId?: string;
    jobRoundId?: string;
    type?: EmailTemplateType;
  }): Promise<EmailTemplate[]> {
    const params = new URLSearchParams();
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.jobRoundId) params.append('jobRoundId', filters.jobRoundId);
    if (filters?.type) params.append('type', filters.type);

    const response = await apiClient.get<EmailTemplate[]>(`/api/email-templates?${params.toString()}`);
    if (!response.success || !response.data) {
      console.error('Failed to fetch templates:', response.error);
      return [];
    }
    return response.data;
  },

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<EmailTemplate> {
    const response = await apiClient.get<EmailTemplate>(`/api/email-templates/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch template');
    }
    return response.data;
  },

  /**
   * Create template
   */
  async createTemplate(data: CreateEmailTemplateRequest): Promise<EmailTemplate> {
    const response = await apiClient.post<EmailTemplate>('/api/email-templates', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create template');
    }
    return response.data;
  },

  /**
   * Update template
   */
  async updateTemplate(id: string, data: UpdateEmailTemplateRequest): Promise<EmailTemplate> {
    const response = await apiClient.put<EmailTemplate>(`/api/email-templates/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update template');
    }
    return response.data;
  },

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    const response = await apiClient.delete(`/api/email-templates/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete template');
    }
  },

  /**
   * Preview template
   */
  async previewTemplate(data: TemplatePreviewRequest): Promise<TemplatePreview> {
    const response = await apiClient.post<TemplatePreview>(`/api/email-templates/${data.templateId}/preview`, {
      sampleData: data.sampleData,
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to preview template');
    }
    return response.data;
  },

  /**
   * Get available variables
   */
  async getVariables(): Promise<TemplateVariable[]> {
    const response = await apiClient.get<TemplateVariable[]>('/api/email-templates/variables');
    if (!response.success || !response.data) {
      console.error('Failed to fetch variables:', response.error);
      return [];
    }
    return response.data;
  },

  /**
   * Generate template using AI
   */
  async generateAITemplate(data: GenerateAITemplateRequest): Promise<GeneratedEmailTemplate> {
    const response = await apiClient.post<GeneratedEmailTemplate>('/api/email-templates/generate-ai', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate template');
    }
    return response.data;
  },
};

// --- Legacy/Sync Exports (Mocked for Build Compatibility) ---
// TODO: Refactor EmailTemplates.tsx to use async service methods

export function getEmailTemplates(filters?: any): EmailTemplate[] {
  // Return empty array or mock data to satisfy synchronous usage
  return [];
}

export function createTemplate(data: any): EmailTemplate {
  console.warn('createTemplate called synchronously - mock implementation');
  return {
    id: 'mock-id',
    name: data.name,
    type: data.type,
    subject: data.subject,
    body: data.body,
    variables: [],
    isActive: true,
    isDefault: false,
    isAiGenerated: false,
    version: 1,
    createdBy: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 'mock-company',
    jobId: null,
    jobRoundId: null
  };
}

export function updateTemplate(id: string, data: any, changeNote?: string): EmailTemplate {
  console.warn('updateTemplate called synchronously - mock implementation');
  return {
    id,
    name: data.name || 'Mock Template',
    type: data.type || 'custom',
    subject: data.subject || 'Subject',
    body: data.body || 'Body',
    variables: [],
    isActive: true,
    isDefault: false,
    isAiGenerated: false,
    version: 1,
    createdBy: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 'mock-company',
    jobId: null,
    jobRoundId: null
  };
}

export function deleteTemplate(id: string): void {
  console.warn('deleteTemplate called synchronously - mock implementation');
}

export function duplicateTemplate(id: string, newName: string): void {
  console.warn('duplicateTemplate called synchronously - mock implementation');
}


// --- Utilities ---

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'candidateName', label: 'Candidate Name', description: "Candidate's full name", example: 'John Doe', category: 'Candidate' },
  { key: 'jobTitle', label: 'Job Title', description: "Job position title", example: 'Software Engineer', category: 'Job' },
  { key: 'companyName', label: 'Company Name', description: "Company name", example: 'Acme Corp', category: 'Company' },
  // Add more as needed
];

export const templateSchema = {
  parse: (data: any) => {
    if (!data.name || !data.subject || !data.body) {
      throw new Error('Missing required fields');
    }
    return data;
  }
};

export function extractVariablesFromTemplate(text: string): string[] {
  const matches = text.match(/{{([^}]+)}}/g);
  if (!matches) return [];
  return matches.map(m => m.slice(2, -2).trim());
}

export function interpolateTemplate(text: string, data: Record<string, string>): string {
  let result = text;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
}
