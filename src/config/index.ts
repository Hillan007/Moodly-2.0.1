// Environment configuration


export const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? window.location.origin  // Use same domain in production
    : 'http://localhost:3000',
  
  APP_NAME: 'Moodly',
  VERSION: '1.0.0'

};

export default config;
