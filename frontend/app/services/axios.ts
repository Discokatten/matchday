import axios from 'axios';

const api = axios.create({
  baseURL: '/api/backend',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      window.dispatchEvent(new Event('matchday:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export default api;
