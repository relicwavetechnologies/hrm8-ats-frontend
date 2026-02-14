/**
 * Job Template API Service
 * Handles all job template-related API calls
 */

import { apiClient } from './api';
import { CreateJobRequest } from './jobService';

export interface JobTemplate {
  id: string;
  companyId: string;
  createdBy: string;
  name: string;
  description?: string;
  category: string;
  isShared: boolean;
  sourceJobId?: string;
  jobData: CreateJobRequest; // All job data stored as JSON
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category?: string;
  isShared?: boolean;
  jobData: CreateJobRequest; // All job data
}

export type UpdateTemplateRequest = Partial<CreateTemplateRequest>;

export interface GetTemplatesFilters {
  category?: string;
  search?: string;
}

export const templateCategories = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "HR",
  "Customer Support",
  "Custom"
];

class JobTemplateService {
  /**
   * Create template from existing job
   */
  async createFromJob(jobId: string, name: string, description?: string, category?: string) {
    return apiClient.post<JobTemplate>(`/api/job-templates/from-job/${jobId}`, {
      name,
      description,
      category,
    });
  }

  /**
   * Create template from scratch
   */
  async createTemplate(data: CreateTemplateRequest) {
    return apiClient.post<JobTemplate>('/api/job-templates', data);
  }

  /**
   * Get all templates for the company
   */
  async getTemplates(filters?: GetTemplatesFilters) {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/job-templates${queryString ? `?${queryString}` : ''}`;

    // Adjust to handle the { templates: [...] } wrapper
    const response = await apiClient.get<{ templates: JobTemplate[] }>(endpoint);
    return {
      success: response.success,
      data: response.data?.templates,
      error: response.error,
      status: response.status
    };
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string) {
    const response = await apiClient.get<{ template: JobTemplate }>(`/api/job-templates/${id}`);
    return {
      success: response.success,
      data: response.data?.template,
      error: response.error,
      status: response.status
    };
  }

  /**
   * Get template data formatted for job creation
   */
  async getTemplateJobData(id: string) {
    return apiClient.get<CreateJobRequest>(`/api/job-templates/${id}/job-data`);
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, data: UpdateTemplateRequest) {
    return apiClient.put<JobTemplate>(`/api/job-templates/${id}`, data);
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string) {
    return apiClient.delete(`/api/job-templates/${id}`);
  }

  /**
   * Record template usage (increment usage count)
   */
  async recordUsage(id: string) {
    return apiClient.post<JobTemplate>(`/api/job-templates/${id}/use`);
  }

  /**
   * Generate a structured template using AI from a broad prompt
   */
  async generateTemplateWithAI(prompt: string) {
    const response = await apiClient.post<{
      name: string;
      description: string;
      category: string;
      jobData: any
    }>('/api/job-templates/generate-ai', { prompt });

    return response;
  }
}

export const jobTemplateService = new JobTemplateService();

/**
 * Functional wrappers for backward compatibility
 */
export const createJobTemplate = (data: any) => {
  return jobTemplateService.createTemplate({
    name: data.name,
    description: data.description,
    category: data.category,
    isShared: data.isShared,
    jobData: data.data || {}
  });
};

export const getJobTemplates = async (category?: string) => {
  const response = await jobTemplateService.getTemplates({ category });
  return response.data || [];
};

export const getJobTemplate = async (id: string) => {
  const response = await jobTemplateService.getTemplate(id);
  return response.data;
};

export const deleteJobTemplate = async (id: string) => {
  const response = await jobTemplateService.deleteTemplate(id);
  return response.success;
};

export const incrementTemplateUsage = async (id: string) => {
  return jobTemplateService.recordUsage(id);
};

export const getMostUsedTemplates = async (limit: number = 5) => {
  const templates = await getJobTemplates();
  return templates
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
};
