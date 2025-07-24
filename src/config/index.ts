// Environment configuration


const config = {
  API_BASE_URL: import.meta.env.PROD 
    ? window.location.origin 
    : 'http://localhost:5000',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL!,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  APP_NAME: 'Moodly',
  VERSION: '1.0.0'
};

export default config;
