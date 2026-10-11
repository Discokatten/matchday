'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSessionHandler() {
  const router = useRouter();

  const handleUnauthorized = useCallback(() => {
    router.replace('/login?expired=true');
    router.refresh();
  }, [router]);

  useEffect(() => {
    window.addEventListener('matchday:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('matchday:unauthorized', handleUnauthorized);
    };
  }, [handleUnauthorized]);

  return null;
}
