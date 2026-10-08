'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import InputField from '@/app/components/InputField';
import Wrapper from '@/app/components/Wrapper';
import {
  loginSchema,
  type LoginFormValues,
} from '@/app/lib/schemas/loginSchema';
import { loginUser } from '@/app/services/auth';

export default function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const submit = form.handleSubmit(async (data) => {
    try {
      await loginUser(data);

      const requestedPath = new URLSearchParams(window.location.search).get(
        'redirect',
      );
      const redirectUrl =
        requestedPath?.startsWith('/') &&
        !requestedPath.startsWith('//') &&
        !requestedPath.includes('\\')
          ? requestedPath
          : '/dashboard';

      router.replace(redirectUrl);
      router.refresh();
    } catch (error) {
      form.setError('root', {
        message:
          error instanceof Error ? error.message : 'Inloggningen misslyckades.',
      });
    }
  });

  return (
    <Wrapper
      footer={
        <Link
          href='/register'
          className='flex flex-row justify-center gap-1 hover:text-primary'
        >
          Har du inget konto ännu?
          <span className='font-semibold underline'>Klicka här</span>
        </Link>
      }
    >
      {notice && <p role='status'>{notice}</p>}

      <form onSubmit={submit} className='grid gap-4'>
        <InputField
          control={form.control}
          name='email'
          label='Användarnamn eller e-post'
          placeholder='local-operator'
          type='text'
          autoComplete='username'
        />

        <InputField
          control={form.control}
          name='password'
          label='Lösenord'
          placeholder='Lösenord'
          type='password'
          autoComplete='current-password'
        />

        {form.formState.errors.root && (
          <p role='alert' className='text-sm text-error'>
            {form.formState.errors.root.message}
          </p>
        )}

        <button
          type='submit'
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          className='max-h-15 rounded-lg bg-primary p-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted dark:text-black'
        >
          {form.formState.isSubmitting ? 'Loggar in…' : 'Logga in'}
        </button>
      </form>
    </Wrapper>
  );
}
