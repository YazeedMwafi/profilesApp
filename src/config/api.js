// API Configuration
export const API_CONFIG = {
  // Your AWS API Gateway URL
  BASE_URL: 'https://qi1mzemdhk.execute-api.eu-central-1.amazonaws.com',
  
  // API Endpoints
  ENDPOINTS: {
    POSTS: '/api/posts',
    PROTECTED: '/api/protected',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
