// Environment configuration
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-app.onrender.com' 
    : 'http://localhost:3000',  // Updated to match Flask port
};

export default config;
