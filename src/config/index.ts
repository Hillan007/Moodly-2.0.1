// Environment configuration
export const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? '/api'  // Use relative path in production
    : 'http://localhost:5000/api',  // Use localhost in development
  
  APP_NAME: 'Moodly',
  VERSION: '1.0.0'
};

export default config;
