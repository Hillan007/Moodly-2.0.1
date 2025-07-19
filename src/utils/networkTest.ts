export const testNetworkConnection = async () => {
  try {
    console.log('Testing network connection...');
    console.log('API_BASE_URL:', 'http://localhost:5000');
    
    // Test basic connectivity
    const healthResponse = await fetch('http://localhost:5000/api/health');
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health check response:', healthData);
    }
    
    // Test CORS preflight
    const corsResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('CORS preflight status:', corsResponse.status);
    
  } catch (error) {
    console.error('Network test failed:', error);
  }
};