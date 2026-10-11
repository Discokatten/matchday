'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type InputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  touched?: boolean;
};

export default function InputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  autoComplete,
}: InputFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className='grid'>
          <label htmlFor={name} className='text-sm text-foreground'>
            {label}
          </label>
          <input
            id={name}
            className='w-full rounded-lg border border-muted/50 bg-background p-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            {...field}
          />
          <p className='mt-2 min-h-5 text-sm text-error'>
            {fieldState.error?.message}
          </p>
        </div>
      )}
    />
  );
}
