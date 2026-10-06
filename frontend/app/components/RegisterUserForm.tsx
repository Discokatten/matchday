'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  registerUserSchema,
  RegisterUserFormValues,
} from '@/app/lib/schemas/registerUserSchema';
import Wrapper from '@/app/components/Wrapper';
import InputField from '@/app/components/InputField';
import { registerUser } from '@/app/services/auth';
import { useRouter } from 'next/navigation';

export default function RegisterUserForm() {
  const router = useRouter();
  const form = useForm<RegisterUserFormValues>({
    resolver: zodResolver(registerUserSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const submit = form.handleSubmit(async (data) => {
    try {
      await registerUser(data);
      router.replace('/login?registered=true');
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
        {form.formState.errors.root && (
          <p role='alert' className='text-sm text-error'>
            {form.formState.errors.root.message}
          </p>
        )}
        <button
          type='submit'
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          className='rounded-lg max-h-15 bg-primary p-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted'
        >
          {form.formState.isSubmitting ? 'Skapar konto…' : 'Skapa konto'}
        </button>
      </form>
    </Wrapper>
  );
}
