// Environment configuration


const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:5000',
  APP_NAME: 'Moodly',
  VERSION: '1.0.0'
};

export default config;
