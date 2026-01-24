
import type { Application } from '@/shared/types/application';

// Mock storage implementation
// In a real app this would be in applicationService using API calls
// This is kept for compatibility with existing UI components that rely on local storage

const STORAGE_KEY = 'hrm8_applications';

export function getApplications(): Application[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function updateApplication(id: string, updates: Partial<Application>): void {
    const applications = getApplications();
    const index = applications.findIndex(a => a.id === id);

    if (index !== -1) {
        applications[index] = {
            ...applications[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        }; // Type assertion used because Application implementation might vary slightly
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    }
}
