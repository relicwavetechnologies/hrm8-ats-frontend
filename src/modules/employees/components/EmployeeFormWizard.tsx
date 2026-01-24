import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Employee } from '@/shared/types/employee';
import { toast } from 'sonner';
import { EmployeePersonalInfoStep } from './forms/EmployeePersonalInfoStep';
import { EmployeeJobDetailsStep } from './forms/EmployeeJobDetailsStep';
import { EmployeeContactInfoStep } from './forms/EmployeeContactInfoStep';
import { EmployeeCompensationStep } from './forms/EmployeeCompensationStep';
import { employeeWizardSchema, employeeStepFields, type EmployeeWizardFormData } from '@/shared/lib/validations';
import { FormWizard, WizardStep } from '@/shared/components/common/FormWizard';

const STEPS: WizardStep<EmployeeWizardFormData>[] = [
  { title: 'Personal Info', component: EmployeePersonalInfoStep, fields: employeeStepFields.personalInfo },
  { title: 'Job Details', component: EmployeeJobDetailsStep, fields: employeeStepFields.jobDetails },
  { title: 'Contact', component: EmployeeContactInfoStep, fields: employeeStepFields.contactInfo },
  { title: 'Compensation', component: EmployeeCompensationStep, fields: employeeStepFields.compensation },
];

interface EmployeeFormWizardProps {
  employee?: Employee;
  onSave: (data: Partial<Employee>) => Promise<void>;
  onCancel: () => void;
}

export function EmployeeFormWizard({ employee, onSave, onCancel }: EmployeeFormWizardProps) {
  const form = useForm<EmployeeWizardFormData>({
    resolver: zodResolver(employeeWizardSchema),
    defaultValues: {
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      dateOfBirth: employee?.dateOfBirth || '',
      gender: employee?.gender || 'prefer-not-to-say',
      jobTitle: employee?.jobTitle || '',
      department: employee?.department || '',
      location: employee?.location || '',
      employmentType: employee?.employmentType || 'full-time',
      status: employee?.status || 'active',
      hireDate: employee?.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
      startDate: employee?.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : '',
      address: employee?.address || '',
      city: employee?.city || '',
      state: employee?.state || '',
      postalCode: employee?.postalCode || '',
      country: employee?.country || 'United States',
      emergencyContactName: employee?.emergencyContactName || '',
      emergencyContactPhone: employee?.emergencyContactPhone || '',
      emergencyContactRelationship: employee?.emergencyContactRelationship || '',
      salary: employee?.salary || 0,
      currency: employee?.currency || 'USD',
    },
  });

  const handleSave = async () => {
    const values = form.getValues();
    
    const employeeData: Partial<Employee> = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      jobTitle: values.jobTitle,
      department: values.department,
      location: values.location,
      employmentType: values.employmentType,
      status: values.status,
      hireDate: new Date(values.hireDate).toISOString(),
      startDate: values.startDate ? new Date(values.startDate).toISOString() : new Date(values.hireDate).toISOString(),
      address: values.address,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country,
      emergencyContactName: values.emergencyContactName,
      emergencyContactPhone: values.emergencyContactPhone,
      emergencyContactRelationship: values.emergencyContactRelationship,
      salary: values.salary,
      currency: values.currency,
      payFrequency: employee?.payFrequency || 'annually',
      skills: employee?.skills || [],
      certifications: employee?.certifications || [],
      notes: employee?.notes || "",
      customFields: employee?.customFields || {},
    };

    await onSave(employeeData);
    toast.success(employee ? 'Employee updated successfully' : 'Employee created successfully');
  };

  return (
    <FormWizard
      steps={STEPS}
      form={form}
      onSave={handleSave}
      onCancel={onCancel}
      entityName="Employee"
    />
  );
}
