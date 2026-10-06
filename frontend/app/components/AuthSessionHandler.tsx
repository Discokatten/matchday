'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSessionHandler() {
  const router = useRouter();

  useEffect(() => {
    function handleUnauthorized() {
      router.replace('/login?expired=true');
      router.refresh();
    }

    window.addEventListener('matchday:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('matchday:unauthorized', handleUnauthorized);
  }, [router]);

  return null;
}
