import axios from 'axios';
import { isApplicationIdentityRequiredProblem } from '../lib/authErrors';

const api = axios.create({
  baseURL: '/api/backend',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const responseData: unknown = axios.isAxiosError(error)
      ? error.response?.data
      : null;
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isApplicationIdentityRequiredProblem(responseData) &&
      typeof window !== 'undefined'
    ) {
      window.dispatchEvent(new Event('matchday:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export default api;
