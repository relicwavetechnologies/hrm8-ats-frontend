# Common Components

This directory contains reusable components and utilities used across the application.

## Form Fields

Reusable form field components with consistent styling and validation error display.

### Available Components

- **FormInput** - Text, email, password, number, tel, url, date inputs
- **FormSelect** - Single-select dropdown
- **FormTextarea** - Multi-line text input
- **FormCheckbox** - Checkbox with label
- **FormMultiSelect** - Multi-value selection with tags and suggestions
- **FormDatePicker** - Single date picker with calendar
- **FormDateRangePicker** - Date range picker
- **FormFileUpload** - File upload with drag & drop

### Basic Usage Example

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormInput, FormSelect, FormTextarea, FormCheckbox } from '@/components/common/form-fields';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.string().min(1, 'Role is required'),
  bio: z.string().optional(),
  active: z.boolean(),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      bio: '',
      active: true,
    },
  });

  return (
    <Form {...form}>
      <form>
        <FormInput
          form={form}
          name="name"
          label="Full Name"
          placeholder="Enter your name"
          required
        />

        <FormInput
          form={form}
          name="email"
          label="Email"
          type="email"
          placeholder="email@example.com"
          required
        />

        <FormSelect
          form={form}
          name="role"
          label="Role"
          placeholder="Select a role"
          required
          options={[
            { value: 'admin', label: 'Administrator' },
            { value: 'user', label: 'User' },
          ]}
        />

        <FormTextarea
          form={form}
          name="bio"
          label="Bio"
          placeholder="Tell us about yourself"
          rows={4}
        />

        <FormCheckbox
          form={form}
          name="active"
          label="Active"
          description="Enable or disable the account"
        />
}
```

### FormMultiSelect

Multi-value selection with tag display and autocomplete suggestions.

```tsx
<FormMultiSelect
  form={form}
  name="skills"
  label="Skills"
  placeholder="Type and press Enter"
  required
  suggestions={['JavaScript', 'TypeScript', 'React', 'Node.js']}
  maxItems={10}
/>
```

### FormDatePicker

Date picker with calendar UI (uses shadcn Calendar component).

```tsx
<FormDatePicker
  form={form}
  name="startDate"
  label="Start Date"
  placeholder="Pick a date"
  required
  disablePast={true}
/>
```

### FormDateRangePicker

Date range picker for selecting from/to dates.

```tsx
<FormDateRangePicker
  form={form}
  fromName="startDate"
  toName="endDate"
  label="Employment Period"
  required
/>
```

### FormFileUpload

File upload with validation and preview.

```tsx
<FormFileUpload
  form={form}
  name="resume"
  label="Resume"
  accept=".pdf,.doc,.docx"
  maxSize={5}
  multiple={false}
  onUpload={async (files) => {
    // Upload files and return URLs
    const urls = await uploadToStorage(files);
    return urls;
  }}
/>
```

## Form Auto-Save

Hook that automatically saves form state to localStorage and restores on mount.

```tsx
import { useFormAutosave } from '@/hooks/use-form-autosave';

function MyForm() {
  const form = useForm({ ... });

  const { clearSavedData, hasSavedData } = useFormAutosave({
    form,
    storageKey: 'employee-form-draft',
    enabled: true,
    debounceMs: 1000,
    excludeFields: ['password'], // Don't save sensitive fields
    onRestore: (data) => {
      console.log('Restored form data:', data);
    },
  });

  return (
    <Form {...form}>
      {/* Your form fields */}
    </Form>
  );
}
```

## Form Analytics

Track form interactions and identify problematic fields.

```tsx
import { useFormAnalytics } from '@/hooks/use-form-analytics';

function MyForm() {
  const form = useForm({ ... });

  const { trackFieldFocus, trackSubmission, getAnalyticsSummary } = useFormAnalytics({
    form,
    formId: 'employee-creation',
    enabled: true,
    onSubmitSuccess: () => {
      const summary = getAnalyticsSummary();
      console.log('Form analytics:', summary);
      
      // Identify problematic fields
      if (summary.problematicFields.length > 0) {
        console.warn('Users struggled with:', summary.problematicFields);
      }
    },
  });

  return (
    <Form {...form}>
      <input 
        onFocus={() => trackFieldFocus('email')}
        {...form.register('email')}
      />
      
      <Button onClick={() => trackSubmission(true)}>
        Submit
      </Button>
    </Form>
  );
}
```

## Dynamic Form Builder

Generate forms dynamically from JSON schemas - perfect for CMS-driven forms.

```tsx
import { FormBuilder, FormSchema } from '@/components/common/form-fields';

const formSchema: FormSchema = {
  id: 'employee-form',
  title: 'Add New Employee',
  description: 'Fill in the employee details',
  layout: 'two-column',
  submitLabel: 'Create Employee',
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      required: true,
      gridSpan: 1,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      gridSpan: 1,
    },
    {
      name: 'department',
      type: 'select',
      label: 'Department',
      required: true,
      options: [
        { value: 'eng', label: 'Engineering' },
        { value: 'sales', label: 'Sales' },
      ],
    },
    {
      name: 'skills',
      type: 'multiselect',
      label: 'Skills',
      suggestions: ['JavaScript', 'Python', 'React'],
      gridSpan: 2,
    },
  ],
};

function MyPage() {
  return (
    <FormBuilder
      schema={formSchema}
      onSubmit={(data) => console.log(data)}
      onCancel={() => router.back()}
    />
  );
}
```

## Error Boundary

Global error boundary component that catches React errors and displays a user-friendly fallback UI.

### Features
- Catches and displays React component errors
- Shows error details in development mode
- Provides "Try Again" and "Go Home" actions
- Can be customized with custom fallback UI

### Usage

Already implemented at the app root level in `App.tsx`. You can also use it for specific sections:

```tsx
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}

// With custom fallback
<ErrorBoundary fallback={<div>Custom error UI</div>}>
  <YourComponent />
</ErrorBoundary>
```

## Notification System

Centralized notification system for consistent toast messages.

### Using the Hook

```tsx
import { useNotification } from '@/hooks/use-notification';

function MyComponent() {
  const notify = useNotification();

  const handleSave = async () => {
    try {
      await saveData();
      notify.success('Data saved successfully');
    } catch (error) {
      notify.error('Failed to save data', {
        description: error.message,
        action: {
          label: 'Retry',
          onClick: () => handleSave(),
        },
      });
    }
  };

  // CRUD operations
  const handleCreate = async () => {
    try {
      await createEmployee();
      notify.created('Employee');
    } catch (error) {
      notify.createFailed('Employee', error.message);
    }
  };

  // Promise-based helper
  const handleUpdate = () => {
    notify.promise(
      updateEmployee(),
      {
        loading: 'Updating employee...',
        success: 'Employee updated successfully',
        error: 'Failed to update employee',
      }
    );
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Using the Service

```tsx
import { notify } from '@/lib/notifications';

// Direct usage without hooks
notify.success('Operation successful');
notify.error('Operation failed');
notify.info('Information message');
notify.warning('Warning message');

// CRUD helpers
notify.crud.created('Employee');
notify.crud.updated('Employer');
notify.crud.deleted('Consultant');
notify.crud.createFailed('Employee', 'Validation error');

// Promise-based
notify.promise(
  fetchData(),
  {
    loading: 'Loading...',
    success: 'Data loaded',
    error: 'Failed to load data',
  }
);
```

## Form Wizard

Reusable wizard component for multi-step forms with standardized navigation, progress tracking, and validation.

### Usage

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormWizard, WizardStep } from '@/components/common/FormWizard';
import { mySchema, type MyFormData } from '@/lib/validations';

const STEPS: WizardStep<MyFormData>[] = [
  { title: 'Basic Info', component: BasicInfoStep, fields: ['name', 'email'] },
  { title: 'Details', component: DetailsStep, fields: ['address', 'phone'] },
];

function MyWizard() {
  const form = useForm<MyFormData>({
    resolver: zodResolver(mySchema),
    defaultValues: { ... },
  });

  const handleSave = async () => {
    const values = form.getValues();
    await saveData(values);
  };

  return (
    <FormWizard
      steps={STEPS}
      form={form}
      onSave={handleSave}
      onCancel={() => router.back()}
      entityName="Employee"
    />
  );
}
```

## Data Table

Comprehensive data table component with sorting, filtering, pagination, and more.

See `src/components/tables/DataTable.tsx` for full documentation and examples.
