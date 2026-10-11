'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/services/auth';

export default function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setError(null);
    try {
      await logoutUser();
      router.replace('/login');
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Det gick inte att logga ut.',
      );
    }
  }

  return (
    <div>
      <button type='button' onClick={logout}>
        Logga ut
      </button>
      {error && (
        <p role='alert' className='text-sm text-error'>
          {error}
        </p>
      )}
    </div>
  );
}
