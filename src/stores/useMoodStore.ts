import { create } from 'zustand';

export interface MoodEntry {
  id: string;
  mood_score: number;
  mood_description: string;
  entry_text: string;
  ai_insights?: string;
  created_at: string;
  tags?: string[];
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
  addEntry: (entry: Omit<MoodEntry, 'id' | 'created_at'>) => void;
  getRecentEntries: (limit?: number) => MoodEntry[];
  getMoodStats: () => MoodStats;
  loadEntries: () => Promise<void>;
}

export const useMoodStore = create<MoodState>((set, get) => ({
  entries: [],
  stats: null,
  isLoading: false,

  addEntry: (entryData) => {
    const newEntry: MoodEntry = {
      ...entryData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    
    set((state) => ({
      entries: [newEntry, ...state.entries]
    }));
  },

  getRecentEntries: (limit = 5) => {
    const { entries } = get();
    return entries
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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

    const average_mood = entries.reduce((sum, entry) => sum + entry.mood_score, 0) / entries.length;
    const recent_entries = entries.slice(0, 7);
    const older_entries = entries.slice(7, 14);
    
    let mood_trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recent_entries.length > 0 && older_entries.length > 0) {
      const recent_avg = recent_entries.reduce((sum, entry) => sum + entry.mood_score, 0) / recent_entries.length;
      const older_avg = older_entries.reduce((sum, entry) => sum + entry.mood_score, 0) / older_entries.length;
      
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
    set({ isLoading: true });
    try {
      // TODO: Replace with actual API call
      // For now, create some mock data
      const mockEntries: MoodEntry[] = [
        {
          id: '1',
          mood_score: 7,
          mood_description: 'happy',
          entry_text: 'Had a great day with friends!',
          ai_insights: 'Your social connections seem to boost your mood significantly.',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          tags: ['social', 'friends']
        },
        {
          id: '2',
          mood_score: 5,
          mood_description: 'calm',
          entry_text: 'Quiet day at home, feeling peaceful.',
          ai_insights: 'Rest and solitude appear to help you maintain emotional balance.',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          tags: ['rest', 'peace']
        }
      ];
      
      set({ entries: mockEntries, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));