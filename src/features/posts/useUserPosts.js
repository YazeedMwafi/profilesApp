import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useApiClient } from './useApiClient';
import { useAuth } from 'react-oidc-context';

export const useUserPosts = (postsPerPage = 10) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const apiClient = useApiClient();
  const toast = useToast();
  const auth = useAuth();
  
  // State to store all user posts and manage pagination
  const [allUserPosts, setAllUserPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch user's posts for a specific page
  const fetchUserPosts = useCallback(async (pageNum = 1, append = false) => {
    if (loading) return;
    
    if (!auth.user) {
      setError('User not authenticated');
      return;
    }
    
    // Get user ID from auth context
    const currentUserId = auth.user.sub || auth.user.profile?.sub;
    
    if (!currentUserId) {
      setError('User not authenticated - no user ID found');
      return;
    }
    
    // If we're loading more posts and already have all user posts, just paginate
    if (append && allUserPosts.length > 0) {
      const startIndex = currentIndex;
      const endIndex = Math.min(startIndex + postsPerPage, allUserPosts.length);
      const newPosts = allUserPosts.slice(startIndex, endIndex);
      
      if (newPosts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setCurrentIndex(endIndex);
        setHasMore(endIndex < allUserPosts.length);
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all posts from backend and filter by user
      const response = await apiClient.getPosts(1, 1000); // Get a large number
      const allPosts = Array.isArray(response) ? response : response.posts || [];
      
      // Filter posts by current user's ID
      const userPosts = allPosts.filter(post => post.authorId === currentUserId);
      
      // Store all user posts
      setAllUserPosts(userPosts);
      
      // Show first page of user posts
      const initialPosts = userPosts.slice(0, postsPerPage);
      setPosts(initialPosts);
      setCurrentIndex(postsPerPage);
      setHasMore(userPosts.length > postsPerPage);
      
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error loading your posts',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [apiClient, postsPerPage, loading, toast, auth.user, allUserPosts, currentIndex]);

  // Load more posts (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUserPosts(nextPage, true);
    }
  }, [page, loading, hasMore, fetchUserPosts]);

  // Refresh posts (reload from page 1)
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setAllUserPosts([]);
    setCurrentIndex(0);
    fetchUserPosts(1, false);
  }, [fetchUserPosts]);

  // Update a post
  const updatePost = async (postId, postData) => {
    try {
      const updatedPost = await apiClient.updatePost(postId, postData);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? updatedPost : post
        )
      );
      toast({
        title: 'Post updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return updatedPost;
    } catch (err) {
      toast({
        title: 'Error updating post',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    }
  };

  // Delete a post
  const deletePost = async (postId) => {
    try {
      await apiClient.deletePost(postId);
      // Remove from both displayed posts and all user posts
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      setAllUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      toast({
        title: 'Post deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error deleting post',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    }
  };

  // Load initial posts
  useEffect(() => {
    fetchUserPosts(1, false);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updatePost,
    deletePost,
  };
};
