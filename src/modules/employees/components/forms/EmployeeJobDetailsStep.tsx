import { UseFormReturn } from 'react-hook-form';
import { FormInput, FormSelect } from '@/shared/components/common/form-fields';

interface EmployeeJobDetailsStepProps {
  form: UseFormReturn<any>;
}

export function EmployeeJobDetailsStep({ form }: EmployeeJobDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Job Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            form={form}
            name="jobTitle"
            label="Job Title"
            placeholder="Software Engineer"
            required
          />
          
          <FormSelect
            form={form}
            name="department"
            label="Department"
            placeholder="Select department"
            options={[
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'HR', label: 'HR' },
              { value: 'Finance', label: 'Finance' },
              { value: 'Operations', label: 'Operations' },
            ]}
          />
          
          <FormInput
            form={form}
            name="location"
            label="Location"
            placeholder="San Francisco, CA"
          />
          
          <FormSelect
            form={form}
            name="employmentType"
            label="Employment Type"
            options={[
              { value: 'full-time', label: 'Full-time' },
              { value: 'part-time', label: 'Part-time' },
              { value: 'contract', label: 'Contract' },
              { value: 'intern', label: 'Intern' },
              { value: 'casual', label: 'Casual' },
            ]}
          />
          
          <FormInput
            form={form}
            name="hireDate"
            label="Hire Date"
            type="date"
            required
          />
          
          <FormInput
            form={form}
            name="startDate"
            label="Start Date"
            type="date"
          />
          
          <FormSelect
            form={form}
            name="status"
            label="Employment Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'on-leave', label: 'On Leave' },
              { value: 'notice-period', label: 'Notice Period' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'terminated', label: 'Terminated' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
