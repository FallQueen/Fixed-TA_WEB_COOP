const DEFAULT_API_BASE_URL = '/api';
const DEFAULT_LOCAL_DIRECT_API_BASE_URL = 'http://127.0.0.1:8000/api';

const normalizeBaseUrl = (value) => {
  if (!value) {
    return DEFAULT_API_BASE_URL;
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL);
const proxyTargetApiUrl = import.meta.env.VITE_API_PROXY_TARGET
  ? `${normalizeBaseUrl(import.meta.env.VITE_API_PROXY_TARGET)}/api`
  : '';
export const LOCAL_DIRECT_API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_LOCAL_API_URL
  || proxyTargetApiUrl
  || DEFAULT_LOCAL_DIRECT_API_BASE_URL
);
export const DIRECT_API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_SSO_API_URL
  || (import.meta.env.DEV ? LOCAL_DIRECT_API_BASE_URL : API_BASE_URL)
);

export const buildApiUrl = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const buildDirectApiUrl = (path = '') => {
  if (!path) {
    return DIRECT_API_BASE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${DIRECT_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const buildLocalDirectApiUrl = (path = '') => {
  if (!path) {
    return LOCAL_DIRECT_API_BASE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${LOCAL_DIRECT_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
