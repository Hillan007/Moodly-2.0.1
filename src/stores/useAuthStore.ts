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
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
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
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
            return true;
          } else {
            const errorData = await response.json();
            console.error('Login failed:', errorData.error);
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            const user: User = {
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              mood_streak: 0,
              created_at: new Date().toISOString(),
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          } else {
            const errorData = await response.json();
            console.error('Signup failed:', errorData.error);
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Signup error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
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