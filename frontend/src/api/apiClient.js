import axios from 'axios';

// Cache GET trong 5 phút để giảm thiểu gọi HTTP thừa khi chuyển trang liên tục
const GET_CACHE_TTL = 5 * 60 * 1000;
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

// Xóa cache thông minh theo module (ví dụ POST /orders chỉ xóa cache của /orders, không xóa /settings hay /categories)
const clearGetCache = (targetUrl = '') => {
  if (!targetUrl) {
    getCache.clear();
    return;
  }
  const cleanUrl = String(targetUrl).split('?')[0];
  const parts = cleanUrl.split('/').filter(Boolean);
  const modulePrefix = parts.length > 0 ? `/${parts[0]}` : cleanUrl;

  for (const key of getCache.keys()) {
    if (key.startsWith(modulePrefix) || key.startsWith(cleanUrl)) {
      getCache.delete(key);
    }
  }
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

// Cache thông minh và gộp request GET trùng nhau khi chuyển trang nhanh.
apiClient.get = (url, config = {}) => {
  const cacheKey = getCacheKey(url, config);
  const now = Date.now();
  const cached = getCache.get(cacheKey);

  // Cho phép bỏ qua cache nếu truyền { skipCache: true }
  if (!config.skipCache) {
    if (cached && cached.expiresAt > now) return Promise.resolve(cached.data);
    if (pendingGets.has(cacheKey)) return pendingGets.get(cacheKey);
  }

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
  apiClient[method] = (url, ...args) => {
    clearGetCache(url);
    return original(url, ...args);
  };
});

apiClient.request = (config) => {
  if ((config?.method || 'get').toLowerCase() !== 'get') {
    clearGetCache(config?.url);
  }
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
