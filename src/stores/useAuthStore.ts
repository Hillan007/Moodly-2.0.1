import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import config from '../config';

interface User {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  mood_streak: number;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const API_BASE_URL = config.API_BASE_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username: email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            const user: User = {
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              mood_streak: 0, // Will be calculated from mood entries
              created_at: new Date().toISOString(),
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return { success: true };
          } else {
            const errorData = await response.json();
            console.error('Login failed:', errorData.error);
            set({ isLoading: false });
            return { success: false, error: errorData.error || 'Login failed' };
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return { success: false, error: 'Network error occurred' };
        }
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({ username, email, password }),
          });

          const data = await response.json();
          
          if (response.ok) {
            set({ 
              user: data.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: data.error || 'Registration failed' };
          }
        } catch (error) {
          console.error('Signup error:', error);
          set({ isLoading: false });
          return { success: false, error: 'Network error - please check your internet connection and try again' };
        }
      },

      logout: async () => {
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        }
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ 
            user: { ...user, ...updates } 
          });
        }
      },
    }),
    {
      name: 'moodly-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);