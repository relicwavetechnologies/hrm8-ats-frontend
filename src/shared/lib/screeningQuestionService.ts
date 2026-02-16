/**
 * Screening questions: AI generation and template save/load
 */

import { apiClient } from './api';
import type { ApplicationQuestion } from '@/shared/types/applicationForm';

export interface GenerateScreeningQuestionsInput {
  jobTitle: string;
  jobDescription?: string;
  companyContext?: string;
  department?: string;
  experienceLevel?: string;
  existingQuestions?: { label: string; type: string }[];
  count?: number;
}

export interface ScreeningTemplateSummary {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  questions: unknown;
  isSystem: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export const screeningQuestionService = {
  async generateScreeningQuestions(
    input: GenerateScreeningQuestionsInput
  ): Promise<ApplicationQuestion[]> {
    const res = await apiClient.post<{ questions: ApplicationQuestion[] }>(
      '/api/ai/screening-questions/generate',
      input
    );
    if (!res.success || !res.data?.questions) {
      throw new Error(res.error || 'Failed to generate screening questions');
    }
    return res.data.questions.map((q, i) => ({
      ...q,
      id: q.id || `sq-${Date.now()}-${i}`,
      order: q.order ?? i,
      options: q.options ?? undefined,
    }));
  },

  async getTemplates(): Promise<ScreeningTemplateSummary[]> {
    const res = await apiClient.get<{ templates: ScreeningTemplateSummary[] }>(
      '/api/screening-templates'
    );
    if (!res.success) throw new Error(res.error || 'Failed to fetch templates');
    return res.data?.templates ?? [];
  },

  async getTemplateById(id: string): Promise<{ template: ScreeningTemplateSummary }> {
    const res = await apiClient.get<{ template: ScreeningTemplateSummary }>(
      `/api/screening-templates/${id}`
    );
    if (!res.success) throw new Error(res.error || 'Failed to fetch template');
    if (!res.data?.template) throw new Error('Template not found');
    return res.data;
  },

  async createTemplate(params: {
    name: string;
    description?: string;
    category?: string;
    questions: ApplicationQuestion[];
  }): Promise<ScreeningTemplateSummary> {
    const res = await apiClient.post<{ template: ScreeningTemplateSummary }>(
      '/api/screening-templates',
      params
    );
    if (!res.success) throw new Error(res.error || 'Failed to save template');
    if (!res.data?.template) throw new Error('No template returned');
    return res.data.template;
  },
};
