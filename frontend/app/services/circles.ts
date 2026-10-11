import axios from 'axios';
import api from './axios';
import type { Circle } from '../lib/interfaces/circleInterface';
import {
  circlePath,
  getCircleErrorMessage as getCircleErrorMessageFromApi,
  parseCircle,
} from '../utils/circleUtils';

export async function getMatchCircle(matchId: string): Promise<Circle> {
  const response = await api.get<unknown>(circlePath(matchId));
  return parseCircle(response.data);
}

export async function createMatchCircle(matchId: string): Promise<Circle> {
  const response = await api.post<unknown>(circlePath(matchId));
  return parseCircle(response.data);
}

export async function joinMatchCircle(matchId: string): Promise<void> {
  await api.put(`${circlePath(matchId)}/membership`);
}

export async function leaveMatchCircle(matchId: string): Promise<void> {
  await api.delete(`${circlePath(matchId)}/membership`);
}

export function isCircleNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function isCircleAlreadyExists(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}

export const getCircleErrorMessage = getCircleErrorMessageFromApi;
