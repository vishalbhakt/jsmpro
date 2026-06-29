import axios from 'axios';
import { safeArray, safeObject } from '@/lib/apiUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor for JWT
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  console.log('Request interceptor – token attached:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken });
          const { access } = res.data;
          localStorage.setItem('token', access);
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Logout user if refresh fails
          localStorage.clear();
          if (typeof window !== 'undefined') window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// CRUD Helper Generator
const crud = (endpoint: string) => ({
  list: (params?: any): Promise<any> => api.get(`${endpoint}/`, { params }).then(res => ({ ...res, data: safeArray(res, `${endpoint} list`) })),
  get: (id: number | string): Promise<any> => api.get(`${endpoint}/${id}/`).then(res => ({ ...res, data: safeObject(res, `${endpoint} get`) })),
  create: (data: any): Promise<any> => api.post(`${endpoint}/`, data).then(res => ({ ...res, data: safeObject(res, `${endpoint} create`) })),
  update: (id: number | string, data: any): Promise<any> => api.patch(`${endpoint}/${id}/`, data).then(res => ({ ...res, data: safeObject(res, `${endpoint} update`) })),
  delete: (id: number | string): Promise<any> => api.delete(`${endpoint}/${id}/`)
});

// Named API Exports
export const authAPI = {
  login: (data: any) => api.post('/auth/token/', data),
  register: (data: any) => api.post('/auth/register/', data),
  profile: () => api.get('/auth/me/'),
  updateProfile: (data: any) => api.patch('/auth/me/', data),
  changePassword: (data: any) => api.post('/auth/change-password/', data),
};

export const dashboardAPI = {
  stats: () => api.get('/dashboard/'),
};

export const usersAPI = {
  ...crud('/users'),
  approve: (id: number | string) => api.post(`/users/${id}/approve/`),
  toggleStatus: (id: number | string) => api.post(`/users/${id}/toggle_status/`),
  resetPassword: (id: number | string, data: any) => api.post(`/users/${id}/reset_password/`, data),
  changeRole: (id: number | string, data: any) => api.post(`/users/${id}/change_role/`, data),
};
export const studentsAPI = {
  ...crud('/students'),
  bulkDelete: (ids: number[]) => api.post('/students/bulk_delete/', { ids }),
  bulkPromote: (ids: number[], classroomId: number) => api.post('/students/bulk_promote/', { ids, classroom_id: classroomId }),
  bulkAssignClass: (ids: number[], classroomId: number) => api.post('/students/bulk_assign_class/', { ids, classroom_id: classroomId }),
};
export const teachersAPI = crud('/teachers');
export const classesAPI = crud('/classes');
export const subjectsAPI = crud('/subjects');
export const academicsAPI = {
  assessments: crud('/assessments'),
  results: crud('/results'),
};

export const attendanceAPI = {
  sessions: crud('/attendance-sessions'),
  records: crud('/attendance-records'),
  bulkMark: (data: any) => api.post('/attendance-sessions/bulk_mark/', data),
};

export const learningAPI = {
  assignments: crud('/assignments'),
  submissions: crud('/submissions'),
  notes: crud('/notes'),
  videos: crud('/videos'),
  quizzes: crud('/quizzes'),
};

export const financeAPI = {
  feePlans: crud('/fee-plans'),
  payments: crud('/payments'),
};

export const communicationAPI = {
  announcements: crud('/announcements'),
  notifications: crud('/notifications'),
  activityLogs: crud('/activity-logs'),
};

export const publicAPI = {
  stats: () => api.get('/public-stats/'),
};

export const cmsAPI = {
  pages: crud('/pages'),
  courses: crud('/courses'),
  facilities: crud('/facilities'),
  gallery: crud('/gallery'),
  inquiries: crud('/inquiries'),
  contactMessages: crud('/contact-messages'),
};

export default api;
