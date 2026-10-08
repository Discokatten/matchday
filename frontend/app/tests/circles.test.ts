import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMatchCircle,
  getCircleErrorMessage,
  getMatchCircle,
  isCircleAlreadyExists,
  isCircleNotFound,
  joinMatchCircle,
  leaveMatchCircle,
} from '../services/circles';
import { AxiosError, AxiosHeaders } from 'axios';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../services/axios', () => ({
  default: apiMock,
}));

const matchId = '10000000-0000-0000-0000-000000000001';
const circleResponse = {
  id: '20000000-0000-0000-0000-000000000001',
  matchId,
  createdAt: '2026-10-06T12:00:00Z',
  membershipActive: true,
};

describe('circles API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets and validates circle state for a match', async () => {
    apiMock.get.mockResolvedValue({ data: circleResponse });

    await expect(getMatchCircle(matchId)).resolves.toEqual(circleResponse);
    expect(apiMock.get).toHaveBeenCalledWith(`/matches/${matchId}/circle`);
  });

  it('rejects malformed circle responses', async () => {
    apiMock.get.mockResolvedValue({
      data: { ...circleResponse, membershipActive: 'yes' },
    });

    await expect(getMatchCircle(matchId)).rejects.toThrow(
      'Circles-API:t returnerade ett ogiltigt svar.',
    );
  });

  it('creates a circle for a match', async () => {
    apiMock.post.mockResolvedValue({ data: circleResponse });

    await expect(createMatchCircle(matchId)).resolves.toEqual(circleResponse);
    expect(apiMock.post).toHaveBeenCalledWith(`/matches/${matchId}/circle`);
  });

  it('joins and leaves a circle using the membership endpoint', async () => {
    apiMock.put.mockResolvedValue({ status: 204 });
    apiMock.delete.mockResolvedValue({ status: 204 });

    await expect(joinMatchCircle(matchId)).resolves.toBeUndefined();
    await expect(leaveMatchCircle(matchId)).resolves.toBeUndefined();

    expect(apiMock.put).toHaveBeenCalledWith(
      `/matches/${matchId}/circle/membership`,
    );
    expect(apiMock.delete).toHaveBeenCalledWith(
      `/matches/${matchId}/circle/membership`,
    );
  });

  it('encodes the match ID in circle paths', async () => {
    apiMock.get.mockResolvedValue({ data: circleResponse });

    await getMatchCircle('id/with spaces');

    expect(apiMock.get).toHaveBeenCalledWith(
      '/matches/id%2Fwith%20spaces/circle',
    );
  });

  it('recognizes missing and conflicting circles', () => {
    const notFound = new AxiosError('Not found');
    notFound.response = {
      data: {},
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    const conflict = new AxiosError('Already exists');
    conflict.response = {
      data: {},
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };

    expect(isCircleNotFound(notFound)).toBe(true);
    expect(isCircleAlreadyExists(conflict)).toBe(true);
    expect(isCircleNotFound(conflict)).toBe(false);
  });

  it('uses API error details for display', () => {
    const error = new AxiosError('Request failed');
    error.response = {
      data: { detail: 'Authentication is required.' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };

    expect(getCircleErrorMessage(error)).toBe('Authentication is required.');
  });

  it('shows an identity configuration message without treating the session as expired', () => {
    const error = new AxiosError('Request failed');
    error.response = {
      data: {
        title: 'Authentication required',
        detail: 'An authenticated user identity is required',
      },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };

    expect(getCircleErrorMessage(error)).toBe(
      'Du är inloggad, men backend kan inte koppla ditt konto till en användaridentitet. Kontrollera backendens auth-konfiguration.',
    );
  });
});
