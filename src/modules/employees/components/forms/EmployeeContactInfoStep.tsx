import { UseFormReturn } from 'react-hook-form';
import { FormInput } from '@/shared/components/common/form-fields';

interface EmployeeContactInfoStepProps {
  form: UseFormReturn<any>;
}

export function EmployeeContactInfoStep({ form }: EmployeeContactInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="space-y-4">
          <FormInput
            form={form}
            name="address"
            label="Address"
            placeholder="123 Main Street"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              form={form}
              name="city"
              label="City"
              placeholder="San Francisco"
            />
            
            <FormInput
              form={form}
              name="state"
              label="State"
              placeholder="CA"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              form={form}
              name="postalCode"
              label="Postal Code"
              placeholder="94102"
            />
            
            <FormInput
              form={form}
              name="country"
              label="Country"
              placeholder="United States"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        <div className="space-y-4">
          <FormInput
            form={form}
            name="emergencyContactName"
            label="Name"
            placeholder="Jane Doe"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              form={form}
              name="emergencyContactPhone"
              label="Phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
            />
            
            <FormInput
              form={form}
              name="emergencyContactRelationship"
              label="Relationship"
              placeholder="Spouse, Parent, etc."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
