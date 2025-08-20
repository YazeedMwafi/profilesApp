import { useAuth } from 'react-oidc-context';
import API_CONFIG from '../../lib/api.js';
import { createAPIError, handleAPIError, retryWithBackoff, isRetryableError } from '../../lib/apiErrorHandler.js';

export const useApiClient = () => {
  const auth = useAuth();

  const makeRequest = async (endpoint, options = {}) => {
    const method = options.method || 'GET';
    
    // Only add Authorization header for non-GET requests
    const authHeaders = (method !== 'GET' && auth.user?.id_token) 
      ? { Authorization: `Bearer ${auth.user.id_token}` } 
      : {};
    

    
    const config = {
      method: method,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    const requestFn = async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createAPIError(response, errorData);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    };

    try {
      return await requestFn();
    } catch (error) {
      // Retry logic for retryable errors
      if (isRetryableError(error)) {
        try {
          return await retryWithBackoff(requestFn, 2, 1000);
        } catch (retryError) {
          throw retryError;
        }
      }
      throw error;
    }
  };

  // Posts API methods
  const getPosts = async (page = 1, limit = 10) => {
    return makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}?page=${page}&limit=${limit}`);
  };

  const getPostById = async (id) => {
    return makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${id}`);
  };

  const createPost = async (postData) => {
    return makeRequest(API_CONFIG.ENDPOINTS.POSTS, {
      method: 'POST',
      body: JSON.stringify({
        content: postData.content,
        tags: postData.tags || []
      }),
    });
  };

  const updatePost = async (id, postData) => {
    return makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  };

  const deletePost = async (id) => {
    return makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${id}`, {
      method: 'DELETE',
    });
  };

  const addComment = async (postId, commentData) => {
    return makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  };

  const likePost = async (postId) => {
    return makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${postId}/like`, {
      method: 'POST',
    });
  };

  const unlikePost = async (postId) => {
    return makeRequest(`${API_CONFIG.ENDPOINTS.POSTS}/${postId}/unlike`, {
      method: 'POST',
    });
  };

  const testProtectedRoute = async () => {
    return makeRequest(API_CONFIG.ENDPOINTS.PROTECTED);
  };

  return {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    addComment,
    likePost,
    unlikePost,
    testProtectedRoute,
    makeRequest,
  };
};
