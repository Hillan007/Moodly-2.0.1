import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

export interface MoodEntry {
  id: number;
  mood: number;
  energy: number;
  anxiety: number;
  sleep: number;
  notes: string;
  ai_insights?: string;
  date: string;
}

export interface MoodStats {
  average_mood: number;
  total_entries: number;
  current_streak: number;
  mood_trend: 'improving' | 'stable' | 'declining';
}

interface MoodState {
  entries: MoodEntry[];
  stats: MoodStats | null;
  isLoading: boolean;
  addEntry: (entry: Omit<MoodEntry, 'id' | 'date'>) => Promise<boolean>;
  getRecentEntries: (limit?: number) => MoodEntry[];
  getMoodStats: () => MoodStats;
  loadEntries: () => Promise<void>;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      stats: null,
      isLoading: false,

      addEntry: async (entryData) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          console.error('User not authenticated');
          return false;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/moods`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              mood_score: entryData.mood,
              energy_level: entryData.energy,
              anxiety_level: entryData.anxiety,
              sleep_quality: entryData.sleep,
              notes: entryData.notes,
            }),
          });

          if (response.ok) {
            // Reload entries to get the updated list
            await get().loadEntries();
            return true;
          } else {
            const errorData = await response.json();
            console.error('Failed to add mood entry:', errorData.error);
            return false;
          }
        } catch (error) {
          console.error('Error adding mood entry:', error);
          return false;
        }
      },

      getRecentEntries: (limit = 5) => {
        const { entries } = get();
        return entries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },

      getMoodStats: () => {
        const { entries } = get();
        
        if (entries.length === 0) {
          return {
            average_mood: 0,
            total_entries: 0,
            current_streak: 0,
            mood_trend: 'stable' as const
          };
        }

        const average_mood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
        const recent_entries = entries.slice(0, 7);
        const older_entries = entries.slice(7, 14);
        
        let mood_trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (recent_entries.length > 0 && older_entries.length > 0) {
          const recent_avg = recent_entries.reduce((sum, entry) => sum + entry.mood, 0) / recent_entries.length;
          const older_avg = older_entries.reduce((sum, entry) => sum + entry.mood, 0) / older_entries.length;
          
          if (recent_avg > older_avg + 0.5) mood_trend = 'improving';
          else if (recent_avg < older_avg - 0.5) mood_trend = 'declining';
        }

        // Calculate streak (simplified)
        const current_streak = Math.min(entries.length, 7);

        return {
          average_mood: Math.round(average_mood * 10) / 10,
          total_entries: entries.length,
          current_streak,
          mood_trend
        };
      },

      loadEntries: async () => {
        const { user } = useAuthStore.getState();
        if (!user) {
          console.error('User not authenticated');
          return;
        }

        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/moods`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            // Transform API data to match our interface
            const transformedEntries = data.moods.map((mood: any) => ({
              id: mood.id,
              mood: mood.mood_score,
              energy: mood.energy_level || 5,
              anxiety: mood.anxiety_level || 5,
              sleep: mood.sleep_quality || 5,
              notes: mood.notes || '',
              ai_insights: mood.ai_insights || '',
              date: mood.created_at,
            }));
            set({ entries: transformedEntries, isLoading: false });
          } else {
            const errorData = await response.json();
            console.error('Failed to load mood entries:', errorData.error);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error loading mood entries:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'moodly-mood-data',
      partialize: (state) => ({ 
        entries: state.entries 
      }),
    }
  )
);