import { UseFormReturn } from 'react-hook-form';
import { FormInput, FormSelect } from '@/shared/components/common/form-fields';

interface EmployeePersonalInfoStepProps {
  form: UseFormReturn<any>;
}

export function EmployeePersonalInfoStep({ form }: EmployeePersonalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            form={form}
            name="firstName"
            label="First Name"
            placeholder="John"
            required
          />
          
          <FormInput
            form={form}
            name="lastName"
            label="Last Name"
            placeholder="Doe"
            required
          />
          
          <FormInput
            form={form}
            name="email"
            label="Email"
            type="email"
            placeholder="john.doe@example.com"
            required
          />
          
          <FormInput
            form={form}
            name="phone"
            label="Phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
          />
          
          <FormInput
            form={form}
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
          />
          
          <FormSelect
            form={form}
            name="gender"
            label="Gender"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'non-binary', label: 'Non-binary' },
              { value: 'prefer-not-to-say', label: 'Prefer not to say' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
