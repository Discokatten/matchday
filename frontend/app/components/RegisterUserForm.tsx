'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import InputField from '@/app/components/InputField';
import Wrapper from '@/app/components/Wrapper';
import {
  registerUserSchema,
  type RegisterUserFormValues,
} from '@/app/lib/schemas/registerUserSchema';
import { registerUser } from '@/app/services/auth';

const defaultValues: RegisterUserFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterUserForm() {
  const router = useRouter();
  const form = useForm<RegisterUserFormValues>({
    resolver: zodResolver(registerUserSchema),
    mode: 'onChange',
    defaultValues,
  });

  const rootError = form.formState.errors.root?.message;
  const isSubmitDisabled =
    !form.formState.isValid || form.formState.isSubmitting;
  const submitButtonLabel = form.formState.isSubmitting
    ? 'Skapar konto…'
    : 'Skapa konto';

  const submit = form.handleSubmit(async (data) => {
    try {
      await registerUser(data);
      router.replace('/login?registered=true');
      router.refresh();
    } catch (error) {
      form.setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Registreringen misslyckades.',
      });
    }
  });

  return (
    <Wrapper
      footer={
        <Link
          href='/login'
          className='flex flex-row justify-center gap-1 hover:text-primary'
        >
          Logga in
        </Link>
      }
    >
      <form onSubmit={submit} className='grid gap-4'>
        <InputField
          control={form.control}
          name='email'
          label='E-post'
          placeholder='E-post'
          type='email'
          autoComplete='email'
        />

        <InputField
          control={form.control}
          name='password'
          label='Lösenord'
          placeholder='Lösenord'
          type='password'
          autoComplete='new-password'
        />

        <InputField
          control={form.control}
          name='confirmPassword'
          label='Bekräfta lösenord'
          placeholder='Bekräfta lösenord'
          type='password'
          autoComplete='new-password'
        />

        {rootError && (
          <p role='alert' className='text-sm text-error'>
            {rootError}
          </p>
        )}

        <button
          type='submit'
          disabled={isSubmitDisabled}
          className='max-h-15 rounded-lg bg-primary p-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted'
        >
          {submitButtonLabel}
        </button>
      </form>
    </Wrapper>
  );
}
