import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Profile {
  username: string;
  bio?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setProfile: (profile: Profile) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  login: (userData: User) => {
    // Store in localStorage
    localStorage.setItem('auth_token', 'demo_token_' + Date.now());
    localStorage.setItem('user_session', JSON.stringify(userData));
    
    // Update store
    set({
      user: userData,
      isAuthenticated: true,
      isLoading: false,
      profile: {
        username: userData.name || userData.email.split('@')[0],
        bio: 'Welcome to Moodly!'
      }
    });
  },

  logout: () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_session');
    
    // Clear store
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    // Redirect to login
    window.location.href = '/login';
  },

  setProfile: (profile: Profile) => {
    set({ profile });
  },

  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    const userSession = localStorage.getItem('user_session');

    if (token && userSession) {
      try {
        const userData = JSON.parse(userSession);
        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          profile: {
            username: userData.name || userData.email.split('@')[0],
            bio: 'Welcome to Moodly!'
          }
        });
      } catch (error) {
        console.error('Error parsing user session:', error);
        get().logout();
      }
    } else {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },
}));