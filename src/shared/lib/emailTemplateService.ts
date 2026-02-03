import { apiClient } from './api';

export type EmailTemplateType =
  | 'APPLICATION_CONFIRMATION'
  | 'NEW'
  | 'ASSESSMENT'
  | 'INTERVIEW_INVITATION'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'OFFER_EXTENDED'
  | 'OFFER'
  | 'OFFER_ACCEPTED'
  | 'HIRED'
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
  attachments?: any;
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

  /**
   * Send test email
   */
  async sendTestEmail(templateId: string, to: string, variables?: Record<string, any>): Promise<void> {
    const response = await apiClient.post(`/api/email-templates/${templateId}/send-test`, { to, variables });
    if (!response.success) {
      throw new Error(response.error || 'Failed to send test email');
    }
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
  // Candidate Variables
  { key: 'candidate.firstName', label: 'Candidate First Name', description: "Candidate's first name", example: 'John', category: 'Candidate' },
  { key: 'candidate.lastName', label: 'Candidate Last Name', description: "Candidate's last name", example: 'Doe', category: 'Candidate' },
  { key: 'candidate.email', label: 'Candidate Email', description: "Candidate's email address", example: 'john@example.com', category: 'Candidate' },
  { key: 'candidate.current_company', label: 'Current Company', description: "Candidate's current employer", example: 'Tech Solutions Inc', category: 'Candidate' },
  { key: 'candidate.current_designation', label: 'Current Designation', description: "Candidate's current job title", example: 'Senior Developer', category: 'Candidate' },
  { key: 'candidate.total_experience', label: 'Total Experience', description: "Years of experience", example: '5', category: 'Candidate' },

  // Job Variables
  { key: 'job.title', label: 'Job Title', description: "Job position title", example: 'Senior Software Engineer', category: 'Job' },
  { key: 'job.location', label: 'Job Location', description: "Job location (City/Remote)", example: 'New York, NY', category: 'Job' },
  { key: 'job.type', label: 'Job Type', description: "Full-time, Contract, etc.", example: 'Full-time', category: 'Job' },
  { key: 'job.salary_min', label: 'Min Salary', description: "Minimum salary range", example: '100000', category: 'Job' },
  { key: 'job.salary_max', label: 'Max Salary', description: "Maximum salary range", example: '150000', category: 'Job' },
  { key: 'job.currency', label: 'Currency', description: "Salary currency", example: 'USD', category: 'Job' },

  // Hiring Manager Variables
  { key: 'job.hiringManager.name', label: 'Hiring Manager Name', description: "Name of the hiring manager", example: 'Alice Smith', category: 'Hiring Team' },
  { key: 'job.hiringManager.email', label: 'Hiring Manager Email', description: "Email of the hiring manager", example: 'alice@company.com', category: 'Hiring Team' },

  // Company Variables
  { key: 'company.name', label: 'Company Name', description: "Company name", example: 'Acme Corp', category: 'Company' },
  { key: 'company.website', label: 'Company Website', description: "Company website URL", example: 'https://acme.com', category: 'Company' },
  { key: 'company.profile.logo', label: 'Company Logo', description: "URL to company logo", example: 'https://logo.url', category: 'Company' },

  // Interviewer Variables (Context specific)
  { key: 'interviewer.name', label: 'Interviewer Name', description: "Name of the interviewer", example: 'Bob Jones', category: 'Interview' },
  { key: 'interviewer.email', label: 'Interviewer Email', description: "Email of the interviewer", example: 'bob@company.com', category: 'Interview' },

  // Legacy / Direct Access
  { key: 'candidateName', label: 'Candidate Full Name', description: "Full Name (Legacy)", example: 'John Doe', category: 'Legacy' },
  { key: 'jobTitle', label: 'Job Title (Legacy)', description: "Job Title (Legacy)", example: 'Developer', category: 'Legacy' },
  { key: 'companyName', label: 'Company Name (Legacy)', description: "Company Name (Legacy)", example: 'Acme Corp', category: 'Legacy' },
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
