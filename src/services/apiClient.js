import API_CONFIG from '../config/api.js';

// API Client for connecting to AWS Lambda backend
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
  }

  // Get authentication token from OIDC user
  getAuthToken() {
    try {
      // Try to get from the OIDC storage key pattern
      const storageKey = Object.keys(localStorage).find(key => 
        key.startsWith('oidc.user:') && key.includes('eu-central-1_eFK9hgEwW')
      );
      
      if (!storageKey) {
        console.log('No OIDC storage key found');
        return null;
      }
      
      const user = JSON.parse(localStorage.getItem(storageKey) || '{}');
      console.log('Retrieved user from storage:', { hasIdToken: !!user.id_token, hasAccessToken: !!user.access_token });
      
      return user.id_token || null; // Use id_token instead of access_token
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  // Make authenticated request
  async makeRequest(endpoint, options = {}) {
    const token = this.getAuthToken();
    const method = options.method || 'GET';
    
    // Only add Authorization header for non-GET requests
    const authHeaders = (method !== 'GET' && token) ? { Authorization: `Bearer ${token}` } : {};
    
    // Debug logging
    if (method !== 'GET') {
      console.log('Making authenticated request:', {
        method,
        endpoint,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
        headers: authHeaders
      });
    }
    
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Posts API methods
  async getPosts() {
    return this.makeRequest(API_CONFIG.ENDPOINTS.POSTS);
  }

  async getPostById(id) {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${id}`);
  }

  async createPost(postData) {
    return this.makeRequest(API_CONFIG.ENDPOINTS.POSTS, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id, postData) {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id) {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${id}`, {
      method: 'DELETE',
    });
  }

  async addComment(postId, commentData) {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async likePost(postId) {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${postId}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(postId) {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${postId}/unlike`, {
      method: 'POST',
    });
  }

  // Test protected endpoint
  async testProtectedRoute() {
    return this.makeRequest(API_CONFIG.ENDPOINTS.PROTECTED);
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export individual methods for easier imports
export const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addComment,
  likePost,
  unlikePost,
  testProtectedRoute,
} = apiClient;
