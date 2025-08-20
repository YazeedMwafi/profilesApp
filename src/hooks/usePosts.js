import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useApiClient } from './useApiClient';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const apiClient = useApiClient();

  // Fetch all posts
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPosts = await apiClient.getPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error fetching posts',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (postData) => {
    try {
      const newPost = await apiClient.createPost(postData);
      setPosts(prevPosts => [newPost, ...prevPosts]);
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

  // Update an existing post
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

  // Add comment to a post
  const addComment = async (postId, commentData) => {
    try {
      const updatedPost = await apiClient.addComment(postId, commentData);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? updatedPost : post
        )
      );
      toast({
        title: 'Comment added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return updatedPost;
    } catch (err) {
      toast({
        title: 'Error adding comment',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    }
  };

  // Like a post
  const likePost = async (postId) => {
    try {
      const updatedPost = await apiClient.likePost(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? updatedPost : post
        )
      );
    } catch (err) {
      toast({
        title: 'Error liking post',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Unlike a post
  const unlikePost = async (postId) => {
    try {
      const updatedPost = await apiClient.unlikePost(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? updatedPost : post
        )
      );
    } catch (err) {
      toast({
        title: 'Error unliking post',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Load posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    refreshPosts: fetchPosts, // Alias for refresh functionality
    createPost,
    updatePost,
    deletePost,
    addComment,
    likePost,
    unlikePost,
  };
};
