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
            const result = await apiClient.get<Annotation[]>(`/api/resumes/${documentId}/annotations`);
            // Extract data from ApiResponse wrapper
            if (result.success && result.data) {
                return result.data;
            }
            return [];
        } catch (error) {
            console.warn('Failed to fetch annotations, returning empty list', error);
            return [];
        }
    }

    async createAnnotation(data: CreateAnnotationRequest): Promise<Annotation> {
        const result = await apiClient.post<Annotation>(`/api/resumes/${data.resume_id}/annotations`, data);
        if (result.success && result.data) {
            return result.data;
        }
        throw new Error(result.error || 'Failed to create annotation');
    }

    async deleteAnnotation(documentId: string, annotationId: string, userId: string): Promise<void> {
        const result = await apiClient.delete(`/api/resumes/${documentId}/annotations/${annotationId}`, { user_id: userId });
        if (!result.success) {
            throw new Error(result.error || 'Failed to delete annotation');
        }
    }
}

export const resumeAnnotationService = new ResumeAnnotationService();

