// Environment configuration
export const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-app.onrender.com'  // Use Render URL in production
    : 'http://localhost:3001',  // Changed from 5000 to 3001
  
  APP_NAME: 'Moodly',
  VERSION: '1.0.0'
};

export default config;
