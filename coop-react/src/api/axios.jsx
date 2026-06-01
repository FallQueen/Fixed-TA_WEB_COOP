import axios from 'axios';
import { API_BASE_URL, LOCAL_DIRECT_API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const DIRECT_RETRY_STATUSES = new Set([404, 405, 502, 503, 504]);
const isAbsoluteUrl = (url = '') => /^https?:\/\//i.test(url);

const shouldRetryWithLocalApi = (error) => {
  const requestConfig = error.config || {};
  const status = error.response?.status;

  return (
    !requestConfig.__localApiRetry
    && !isAbsoluteUrl(requestConfig.url)
    && LOCAL_DIRECT_API_BASE_URL !== API_BASE_URL
    && (!error.response || DIRECT_RETRY_STATUSES.has(status))
  );
};

// Otomatis pasang token di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!shouldRetryWithLocalApi(error)) {
      return Promise.reject(error);
    }

    return api.request({
      ...error.config,
      baseURL: LOCAL_DIRECT_API_BASE_URL,
      __localApiRetry: true,
    });
  }
);

export default api;
