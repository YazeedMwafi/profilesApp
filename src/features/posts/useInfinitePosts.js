import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useApiClient } from './useApiClient';

export const useInfinitePosts = (postsPerPage = 10) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const apiClient = useApiClient();
  const toast = useToast();

  // State to store all posts and manage pagination
  const [allPosts, setAllPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch all posts once and manage pagination client-side
  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (loading) return;
    
    // If we're loading more posts and already have all posts, just paginate
    if (append && allPosts.length > 0) {
      const startIndex = currentIndex;
      const endIndex = Math.min(startIndex + postsPerPage, allPosts.length);
      const newPosts = allPosts.slice(startIndex, endIndex);
      
      if (newPosts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setCurrentIndex(endIndex);
        setHasMore(endIndex < allPosts.length);
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all posts from backend (it doesn't support pagination)
      const response = await apiClient.getPosts(1, 1000); // Get a large number
      const fetchedPosts = Array.isArray(response) ? response : response.posts || [];
      
      // Store all posts
      setAllPosts(fetchedPosts);
      
      // Show first page of posts
      const initialPosts = fetchedPosts.slice(0, postsPerPage);
      setPosts(initialPosts);
      setCurrentIndex(postsPerPage);
      setHasMore(fetchedPosts.length > postsPerPage);
      
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error loading posts',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [apiClient, postsPerPage, loading, toast, allPosts, currentIndex]);

  // Load more posts (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  }, [page, loading, hasMore, fetchPosts]);

  // Refresh posts (reload from page 1)
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setAllPosts([]);
    setCurrentIndex(0);
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Create a new post
  const createPost = async (postData) => {
    try {
      const newPost = await apiClient.createPost(postData);
      // Add to both displayed posts and all posts
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setAllPosts(prevPosts => [newPost, ...prevPosts]);
      toast({
        title: 'Post created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return newPost;
    } catch (err) {
      toast({
        title: 'Error creating post',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    }
  };

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
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
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
    fetchPosts(1, false);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    createPost,
    updatePost,
    deletePost,
  };
};
