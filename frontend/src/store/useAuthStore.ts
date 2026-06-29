import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  first_name: string;
  last_name: string;
  full_name: string;
  avatar: string | null;
  phone?: string;
  address?: string;
  created_at?: string;
  profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setHydrated: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isHydrated: false,
  setAuth: (user, token, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({ user, token, refreshToken });
  },
  setHydrated: () => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refresh_token');
        set({ user, token, refreshToken, isHydrated: true });
      } catch (e) {
        console.error('Failed to hydrate auth store', e);
        set({ isHydrated: true });
      }
    }
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
    set({ user: null, token: null, refreshToken: null });
  },
}));
