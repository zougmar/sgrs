import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key]);
      } else if (key === 'imageUrl' && typeof data[key] === 'string' && data[key].trim() !== '') {
        formData.append('imageUrl', data[key]);
      } else if (key === 'images' && Array.isArray(data[key])) {
        data[key].forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else if (key === 'imageUrls' && Array.isArray(data[key])) {
        data[key].forEach((url) => {
          if (typeof url === 'string' && url.trim() !== '') {
            formData.append('imageUrls', url);
          }
        });
      } else if (key === 'features' && Array.isArray(data[key])) {
        data[key].forEach((feature) => formData.append('features', feature));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'image') {
        if (data[key] instanceof File) {
          formData.append('image', data[key]);
        } else if (data[key] && typeof data[key] === 'string') {
          // If it's an existing image URL, send it as a string
          formData.append('image', data[key]);
        }
      } else if (key === 'imageUrl' && typeof data[key] === 'string' && data[key].trim() !== '') {
        formData.append('imageUrl', data[key]);
      } else if (key === 'images' && Array.isArray(data[key])) {
        // Separate files from URLs
        const imageFiles = data[key].filter(img => img instanceof File);
        const imageUrls = data[key].filter(img => typeof img === 'string' && !img.startsWith('blob:'));
        
        // Append new files
        imageFiles.forEach((image) => {
          formData.append('images', image);
        });
        
        // Append existing URLs
        imageUrls.forEach((imageUrl) => {
          formData.append('existingImages', imageUrl);
        });
      } else if (key === 'imageUrls' && Array.isArray(data[key])) {
        // Append new image URLs
        data[key].forEach((url) => {
          if (typeof url === 'string' && url.trim() !== '') {
            formData.append('imageUrls', url);
          }
        });
      } else if (key === 'features' && Array.isArray(data[key])) {
        data[key].forEach((feature) => formData.append('features', feature));
      } else if (key !== 'existingImages' && key !== 'imageUrls') {
        // Don't append existingImages or imageUrls here, they're handled above
        formData.append(key, data[key]);
      }
    });
    return api.put(`/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/services/${id}`),
};

// Projects API
export const projectsAPI = {
  getAll: (category) => {
    const params = category ? { category } : {};
    return api.get('/projects', { params });
  },
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'images' && Array.isArray(data[key])) {
        data[key].forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else if (key === 'imageUrls' && Array.isArray(data[key])) {
        // Append image URLs
        data[key].forEach((url) => {
          if (typeof url === 'string' && url.trim() !== '') {
            formData.append('imageUrls', url);
          }
        });
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'images' && Array.isArray(data[key])) {
        // Only append File objects as new images
        data[key].forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else if (key === 'existingImages' && Array.isArray(data[key])) {
        // Append existing image URLs
        data[key].forEach((imageUrl) => {
          if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
            formData.append('existingImages', imageUrl);
          }
        });
      } else if (key === 'imageUrls' && Array.isArray(data[key])) {
        // Append new image URLs
        data[key].forEach((url) => {
          if (typeof url === 'string' && url.trim() !== '') {
            formData.append('imageUrls', url);
          }
        });
      } else if (key !== 'existingImages' && key !== 'imageUrls') {
        // Append all other fields except existingImages (handled above)
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      }
    });
    return api.put(`/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/projects/${id}`),
};

// Contact API
export const contactAPI = {
  create: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  getById: (id) => api.get(`/contact/${id}`),
  delete: (id) => api.delete(`/contact/${id}`),
};

// Products API
// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  bulkDelete: (userIds) => api.post('/users/bulk-delete', { userIds }),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'image') {
        if (data[key] instanceof File) {
          formData.append('image', data[key]);
        } else if (data[key] && typeof data[key] === 'string' && data[key].trim() !== '') {
          // If it's a string URL, send it as imageUrl
          formData.append('imageUrl', data[key]);
        }
      } else if (key === 'imageUrl' && typeof data[key] === 'string' && data[key].trim() !== '') {
        formData.append('imageUrl', data[key]);
      } else if (key === 'images' && Array.isArray(data[key])) {
        data[key].forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else if (key === 'imageUrls' && Array.isArray(data[key])) {
        data[key].forEach((url) => {
          if (typeof url === 'string' && url.trim() !== '') {
            formData.append('imageUrls', url);
          }
        });
      } else if (key !== 'existingImages') {
        // Don't send existingImages for create, only for update
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      }
    });
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'image') {
        if (data[key] instanceof File) {
          formData.append('image', data[key]);
        } else if (data[key] && typeof data[key] === 'string') {
          formData.append('image', data[key]);
        }
      } else if (key === 'imageUrl' && typeof data[key] === 'string' && data[key].trim() !== '') {
        formData.append('imageUrl', data[key]);
      } else if (key === 'images' && Array.isArray(data[key])) {
        const imageFiles = data[key].filter(img => img instanceof File);
        const imageUrls = data[key].filter(img => typeof img === 'string' && !img.startsWith('blob:'));
        
        imageFiles.forEach((image) => {
          formData.append('images', image);
        });
        
        imageUrls.forEach((imageUrl) => {
          formData.append('existingImages', imageUrl);
        });
      } else if (key === 'imageUrls' && Array.isArray(data[key])) {
        data[key].forEach((url) => {
          if (typeof url === 'string' && url.trim() !== '') {
            formData.append('imageUrls', url);
          }
        });
      } else if (key === 'existingImages' && Array.isArray(data[key])) {
        // Send existing images as individual form fields
        data[key].forEach((url) => {
          if (typeof url === 'string' && url.trim() !== '') {
            formData.append('existingImages', url);
          }
        });
      } else if (key !== 'existingImages' && key !== 'imageUrls') {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      }
    });
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/products/${id}`),
  bulkDelete: (productIds) => api.post('/products/bulk-delete', { productIds }),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

export default api;
