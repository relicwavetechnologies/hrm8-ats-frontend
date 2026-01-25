import { apiClient } from '@/shared/services/api';

export interface Annotation {
    id: string;
    resume_id: string;
    user_id: string;
    user_name: string;
    user_color: string;
    type: 'highlight' | 'comment';
    text: string;
    comment?: string;
    position: string | { start: number; end: number }; // handled as string or object
    created_at: string;
}

export interface CreateAnnotationRequest {
    resume_id: string;
    user_id: string;
    user_name: string;
    user_color: string;
    type: 'highlight' | 'comment';
    text: string;
    comment?: string;
    position: { start: number; end: number };
}

class ResumeAnnotationService {
    async getAnnotations(documentId: string): Promise<Annotation[]> {
        try {
            // Use a real endpoint if available, for now mocking or assuming standard CRUD
            // return apiClient.get<Annotation[]>(`/api/candidates/resumes/${documentId}/annotations`);

            // Return empty array for now to prevent runtime crashes if API is not ready
            // or check if we should mock it using localStorage
            const result = await apiClient.get<Annotation[]>(`/api/resumes/${documentId}/annotations`);
            return result || [];
        } catch (error) {
            console.warn('Failed to fetch annotations, returning empty list', error);
            return [];
        }
    }

    async createAnnotation(data: CreateAnnotationRequest): Promise<Annotation> {
        return apiClient.post<Annotation>(`/api/resumes/${data.resume_id}/annotations`, data);
    }

    async deleteAnnotation(documentId: string, annotationId: string, userId: string): Promise<void> {
        await apiClient.delete(`/api/resumes/${documentId}/annotations/${annotationId}`);
    }
}

export const resumeAnnotationService = new ResumeAnnotationService();
