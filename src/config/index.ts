// Environment configuration
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://hillan007.pythonanywhere.com'  // Correct PythonAnywhere URL format
    : 'http://localhost:3000',  // Updated to match Flask port
};

export default config;
