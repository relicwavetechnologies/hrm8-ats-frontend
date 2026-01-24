import { UseFormReturn } from 'react-hook-form';
import { FormInput, FormSelect } from '@/shared/components/common/form-fields';

interface EmployeeCompensationStepProps {
  form: UseFormReturn<any>;
}

export function EmployeeCompensationStep({ form }: EmployeeCompensationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Compensation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            form={form}
            name="salary"
            label="Salary"
            type="number"
            placeholder="75000"
          />
          
          <FormSelect
            form={form}
            name="currency"
            label="Currency"
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
              { value: 'CAD', label: 'CAD' },
              { value: 'AUD', label: 'AUD' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
