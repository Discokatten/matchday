'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Circle } from '../lib/interfaces/circleInterface';
import {
  createMatchCircle,
  getCircleErrorMessage,
  getMatchCircle,
  isCircleAlreadyExists,
  isCircleNotFound,
  joinMatchCircle,
  leaveMatchCircle,
} from '../services/circles';

type CircleConversationProps = {
  matchId: string;
};

const EMPTY_ERROR_MESSAGE = null;

export default function CircleConversation({
  matchId,
}: CircleConversationProps) {
  const [circle, setCircle] = useState<Circle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(EMPTY_ERROR_MESSAGE);

  const refreshCircle = useCallback(async () => {
    setIsLoading(true);
    setError(EMPTY_ERROR_MESSAGE);

    try {
      const nextCircle = await getMatchCircle(matchId);
      setCircle(nextCircle);
    } catch (cause) {
      if (isCircleNotFound(cause)) {
        setCircle(null);
        return;
      }

      setError(getCircleErrorMessage(cause));
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadCircle() {
      try {
        const nextCircle = await getMatchCircle(matchId);
        if (!isCancelled) {
          setCircle(nextCircle);
        }
      } catch (cause) {
        if (isCancelled) {
          return;
        }

        if (isCircleNotFound(cause)) {
          setCircle(null);
          return;
        }

        setError(getCircleErrorMessage(cause));
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCircle();

    return () => {
      isCancelled = true;
    };
  }, [matchId]);

  const updateMembership = useCallback(async () => {
    setIsUpdating(true);
    setError(EMPTY_ERROR_MESSAGE);

    try {
      if (!circle) {
        try {
          const nextCircle = await createMatchCircle(matchId);
          setCircle(nextCircle);
          return;
        } catch (cause) {
          if (!isCircleAlreadyExists(cause)) {
            throw cause;
          }

          await refreshCircle();
          return;
        }
      }

      if (circle.membershipActive) {
        await leaveMatchCircle(matchId);
      } else {
        await joinMatchCircle(matchId);
      }

      await refreshCircle();
    } catch (cause) {
      setError(getCircleErrorMessage(cause));
    } finally {
      setIsUpdating(false);
    }
  }, [circle, matchId, refreshCircle]);

  const membershipLabel = !circle
    ? 'Skapa grupp'
    : circle.membershipActive
      ? 'Lämna grupp'
      : 'Gå med i grupp';

  return (
    <section className='m-4 grid w-full max-w-xl gap-4 rounded-2xl border border-primary-dark/15 bg-surface p-6 shadow-md shadow-primary-dark/10'>
      <p className='text-sm text-muted'>
        Gå med i gruppen för att delta i konversationen.
      </p>

      {isLoading ? (
        <p role='status'>Hämtar grupp...</p>
      ) : (
        <>
          {circle && (
            <dl className='grid gap-2 text-sm'>
              <div className='flex justify-between gap-4'>
                <dt>Circle</dt>
                <dd className='break-all text-right'>{circle.id}</dd>
              </div>
              <div className='flex justify-between gap-4'>
                <dt>Skapad</dt>
                <dd>{new Date(circle.createdAt).toLocaleString('sv-SE')}</dd>
              </div>
              <div className='flex justify-between gap-4'>
                <dt>Medlemskap</dt>
                <dd>{circle.membershipActive ? 'Aktivt' : 'Inte medlem'}</dd>
              </div>
            </dl>
          )}

          <button
            type='button'
            onClick={updateMembership}
            disabled={isUpdating}
            className='rounded-lg bg-primary p-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60'
          >
            {isUpdating ? 'Uppdaterar…' : membershipLabel}
          </button>
        </>
      )}

      {error && (
        <p role='alert' className='text-sm text-error'>
          {error}
        </p>
      )}
    </section>
  );
}
