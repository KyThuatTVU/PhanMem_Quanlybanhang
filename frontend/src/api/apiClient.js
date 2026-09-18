import axios from 'axios';

const GET_CACHE_TTL = 30 * 1000;
const getCache = new Map();
const pendingGets = new Map();

const serializeParams = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null) searchParams.set(key, String(value));
    });
  return searchParams.toString();
};

const getCacheKey = (url, config = {}) => {
  const query = serializeParams(config.params);
  return query ? `${url}?${query}` : url;
};

const clearGetCache = () => {
  getCache.clear();
};

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const rawGet = apiClient.get.bind(apiClient);
const rawRequest = apiClient.request.bind(apiClient);

// Cache ngắn hạn và gộp request GET trùng nhau khi chuyển trang nhanh.
apiClient.get = (url, config = {}) => {
  const cacheKey = getCacheKey(url, config);
  const now = Date.now();
  const cached = getCache.get(cacheKey);

  if (cached && cached.expiresAt > now) return Promise.resolve(cached.data);
  if (pendingGets.has(cacheKey)) return pendingGets.get(cacheKey);

  const request = rawGet(url, config)
    .then((data) => {
      getCache.set(cacheKey, { data, expiresAt: Date.now() + GET_CACHE_TTL });
      return data;
    })
    .finally(() => pendingGets.delete(cacheKey));

  pendingGets.set(cacheKey, request);
  return request;
};

['post', 'put', 'patch', 'delete'].forEach((method) => {
  const original = apiClient[method].bind(apiClient);
  apiClient[method] = (...args) => {
    clearGetCache();
    return original(...args);
  };
});

apiClient.request = (config) => {
  if ((config?.method || 'get').toLowerCase() !== 'get') clearGetCache();
  return rawRequest(config);
};

// Request Interceptor: Tự động đính kèm Access Token vào Header Authorization
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý tập trung các lỗi 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Có lỗi xảy ra khi kết nối tới máy chủ!';
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject({
      message,
      statusCode,
      errorCode: error.response?.data?.errorCode || 'API_ERROR',
      data: error.response?.data,
    });
  }
);

export default apiClient;
