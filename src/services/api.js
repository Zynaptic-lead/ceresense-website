import axios from 'axios';

// ============================================
// CONFIGURATION
// ============================================
const BASE_URL = 'https://blog.ceresense.com.ng/api';
// For production: const BASE_URL = 'https://your-domain.com/api';

// ============================================
// AXIOS INSTANCE
// ============================================
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ============================================
// REQUEST INTERCEPTOR - Attach Token
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - Handle Errors
// ============================================
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('⚠️ Access denied. You do not have permission.');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('🔥 Server error. Please try again later.');
    }

    // Handle Network Error
    if (error.message === 'Network Error') {
      console.error('🌐 Network error. Cannot connect to server.');
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authApi = {
  /**
   * Login with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - { status, data: { user, accessToken } }
   */
  login: (credentials) => api.post('/login', credentials),

  /**
   * Logout current user
   * @returns {Promise}
   */
  logout: () => api.post('/logout'),

  /**
   * Get current user profile
   * @returns {Promise} - { status, data: user }
   */
  me: () => api.get('/me'),

  /**
   * Refresh authentication token
   * @returns {Promise} - { status, data: { accessToken } }
   */
  refresh: () => api.post('/refresh'),
};

// ============================================
// BLOG API
// ============================================
export const blogApi = {
  getAll: (params) => api.get('/blog', { params }),
  getById: (id) => api.get(`/blog/${id}`),
  create: (data, config) => api.post('/blog', data, config),
  update: (id, data, config) => api.put(`/blog/${id}`, data, config),
  delete: (id) => api.delete(`/blog/${id}`),
  uploadCover: (formData) => api.post('/blog/upload/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ============================================
// CATEGORY API
// ============================================
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ============================================
// USER MANAGEMENT API (Admin)
// ============================================
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ============================================
// GALLERY API
// ============================================
export const galleryApi = {
  getAll: () => api.get('/gallery'),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (data) => api.post('/gallery', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/gallery/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/gallery/${id}`),
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
};

export default api;