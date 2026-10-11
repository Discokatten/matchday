import axios from 'axios';
import type { Circle } from '../lib/interfaces/circleInterface';
import { isApplicationIdentityRequiredProblem } from '../lib/authErrors';

const INVALID_CIRCLE_RESPONSE_MESSAGE =
  'Circles-API:t returnerade ett ogiltigt svar.';
const UNEXPECTED_CIRCLE_ERROR_MESSAGE =
  'Ett oväntat fel uppstod när gruppen hämtades.';

function hasStringField(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === 'string';
}

export function isCircle(value: unknown): value is Circle {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const circle = value as Record<string, unknown>;

  return (
    hasStringField(circle, 'id') &&
    hasStringField(circle, 'matchId') &&
    hasStringField(circle, 'createdAt') &&
    Number.isFinite(Date.parse(circle.createdAt as string)) &&
    typeof circle.membershipActive === 'boolean'
  );
}

export function circlePath(matchId: string): string {
  return `/matches/${encodeURIComponent(matchId)}/circle`;
}

export function parseCircle(data: unknown): Circle {
  if (!isCircle(data)) {
    throw new Error(INVALID_CIRCLE_RESPONSE_MESSAGE);
  }

  return data;
}

function getErrorMessageFromResponse(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const responseData = data as Record<string, unknown>;

  if (typeof responseData.detail === 'string') {
    return responseData.detail;
  }

  if (typeof responseData.message === 'string') {
    return responseData.message;
  }

  return null;
}

export function getCircleErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : UNEXPECTED_CIRCLE_ERROR_MESSAGE;
  }

  const responseData = error.response?.data;

  if (
    error.response?.status === 401 &&
    isApplicationIdentityRequiredProblem(responseData)
  ) {
    return 'Du är inloggad, men backend kan inte koppla ditt konto till en användaridentitet. Kontrollera backendens auth-konfiguration.';
  }

  const responseMessage = getErrorMessageFromResponse(responseData);

  if (responseMessage) {
    return responseMessage;
  }

  if (error.response?.status === 503) {
    return 'Circles-API:t är inte tillgängligt med utvecklingsinloggning.';
  }

  return `Circles-API:t misslyckades (${error.response?.status ?? 'nätverksfel'}).`;
}
