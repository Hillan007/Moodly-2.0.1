import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  username: string
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood_score: number
  energy_level: number
  anxiety_level: number
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  energy_level: number
  anxiety_level: number
  notes?: string
  created_at: string
}

export interface MusicRecommendation {
  id: string
  user_id: string
  mood_score: number
  energy_level: number
  anxiety_level: number
  recommendations: any
  created_at: string
}