import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  mood_streak: number;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  isAuthenticated: false,
  isLoading: false,

  checkAuth: async () => {
    set({ loading: true, isLoading: true });
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const sessionUser = data.session?.user ?? null;
      set({ user: sessionUser, isAuthenticated: !!sessionUser });
      if (sessionUser) {
        await get().fetchProfile();
      }
    } catch (error) {
      console.error('Check auth error:', error);
      set({ user: null, profile: null, isAuthenticated: false });
    } finally {
      set({ loading: false, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ user: data.user, isAuthenticated: true });
      await get().fetchProfile();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ loading: false, isLoading: false });
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    set({ loading: true, isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('rate limit') || error.message?.includes('email rate')) {
          throw new Error('Too many signup attempts. Please wait a few hours before trying again with this email.');
        }
        throw error;
      }

      if (data.user) {
        set({ user: data.user, isAuthenticated: true });

        // Get the session token
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        // Manually create profile if auth trigger doesn't
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for trigger

          // Try to fetch profile first
          const { data: profileData, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (fetchError || !profileData) {
            // Profile doesn't exist, create it manually via backend
            if (token) {
              try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const createResponse = await fetch(`${apiBaseUrl}/api/profile/create`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    username: username,
                    email: email,
                    avatar_url: null
                  })
                });

                if (!createResponse.ok) {
                  console.warn('Backend profile creation failed, trying direct insert...');
                }
              } catch (backendError) {
                console.warn('Backend profile creation error (non-critical):', backendError);
              }
            }

            // Also try direct Supabase insert as fallback
            try {
              const { error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  username: username,
                  email: email,
                  avatar_url: null,
                  mood_streak: 0
                });

              if (createError) {
                console.warn('Direct Supabase profile insert error (non-critical):', createError);
              }
            } catch (insertError) {
              console.warn('Profile insert exception (non-critical):', insertError);
            }
          }

          // Fetch the profile (either existing or newly created)
          await get().fetchProfile();
        } catch (profileError) {
          console.warn('Profile creation warning (non-critical):', profileError);
          // Don't fail signup if profile creation fails - auth succeeded
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      set({ loading: false, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, profile: null, isAuthenticated: false });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  logout: async () => {
    await get().signOut();
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null
      }));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      set({ profile: data });
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  },
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  const { fetchProfile } = useAuthStore.getState();

  if (event === 'SIGNED_IN' && session?.user) {
    useAuthStore.setState({ user: session.user, isAuthenticated: true });
    fetchProfile();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, profile: null, isAuthenticated: false });
  }
});