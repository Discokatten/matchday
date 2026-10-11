import type { Match } from '../lib/interfaces/matchInterface';
import { isMatch } from '@/app/utils/matchUtils';

const MATCHES_API_URL = (process.env.API_URL ?? 'http://localhost:8080').replace(
  /\/$/,
  '',
);

export async function getMatches(): Promise<Match[]> {
  const response = await fetch(`${MATCHES_API_URL}/api/v1/matches`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error, ${response.status}.`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || !data.every(isMatch)) {
    throw new Error('Matchnings-API:t returnerade en ogiltig matchlista.');
  }

  return data;
}
