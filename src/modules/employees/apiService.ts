import { apiClient } from '@/shared/lib/api';
import { Employee } from '@/shared/types/employee';

/**
 * Maps a backend User object to a frontend Employee object
 */
export const mapUserToEmployee = (user: any): Employee => {
    const nameParts = (user.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

    return {
        id: user.id,
        employeeId: user.id?.substring(0, 8).toUpperCase() || 'EMP-001',
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: '',
        gender: 'prefer-not-to-say',
        avatar: user.avatar || undefined,
        jobTitle: 'Team Member',
        department: 'General',
        location: 'Remote',
        employmentType: 'full-time',
        status: user.status === 'ACTIVE' || user.status === 'VERIFIED' ? 'active' : 'inactive',
        hireDate: user.created_at || new Date().toISOString(),
        startDate: user.created_at || new Date().toISOString(),
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        salary: 0,
        currency: 'USD',
        payFrequency: 'monthly',
        createdAt: user.created_at || new Date().toISOString(),
        updatedAt: user.updated_at || new Date().toISOString(),
        createdBy: user.assigned_by || 'system'
    };
};

/**
 * Fetches all employees from the backend
 */
export const getEmployees = async (): Promise<Employee[]> => {
    try {
        const response = await apiClient.get<{ users: any[] }>('/api/employees');
        if (response.success && response.data?.users) {
            return response.data.users.map(mapUserToEmployee);
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch employees:', error);
        return [];
    }
};

/**
 * Fetches an employee by ID
 */
export const getEmployeeById = async (id: string): Promise<Employee | undefined> => {
    try {
        const response = await apiClient.get<{ user: any }>(`/api/employees/${id}`);
        if (response.success && response.data?.user) {
            return mapUserToEmployee(response.data.user);
        }
        return undefined;
    } catch (error) {
        console.error(`Failed to fetch employee ${id}:`, error);
        return undefined;
    }
};

/**
 * Saves (creates or updates) an employee
 */
export const saveEmployee = async (employee: Partial<Employee>): Promise<boolean> => {
    try {
        const endpoint = employee.id ? `/api/employees/${employee.id}` : '/api/employees';
        const method = employee.id ? 'put' : 'post';

        // Map frontend fields back to backend expectations if needed
        const backendData = {
            name: `${employee.firstName} ${employee.lastName}`.trim(),
            email: employee.email,
            role: 'MEMBER', // Default role for new users
        };

        const response = await apiClient[method](endpoint, backendData);
        return response.success;
    } catch (error) {
        console.error('Failed to save employee:', error);
        return false;
    }
};

/**
 * Deletes an employee
 */
export const deleteEmployee = async (id: string): Promise<boolean> => {
    try {
        const response = await apiClient.delete(`/api/employees/${id}`);
        return response.success;
    } catch (error) {
        console.error(`Failed to delete employee ${id}:`, error);
        return false;
    }
};
