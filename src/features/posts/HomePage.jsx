import { Box, Heading, VStack, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { PostCard } from "./PostCard";
import { PostForm } from "./PostForm";
import { InfiniteScroll } from "../../lib/InfiniteScroll";
import { useInfinitePosts } from "./useInfinitePosts";

export const HomePage = () => {
  const { posts, loading, error, hasMore, loadMore, createPost, refresh } = useInfinitePosts(10);

  const handleAddPost = async (newPost) => {
    try {
      await createPost(newPost);
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Box maxW="800px" mx="auto" textAlign="center" py={8}>
        <Spinner size="xl" />
        <Heading mt={4} fontSize="lg">Loading posts...</Heading>
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto">
      <Heading mb={6} fontSize="2xl">
        Recent Posts
      </Heading>
      
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <PostForm onSubmit={handleAddPost} />
      
      <InfiniteScroll
        hasMore={hasMore}
        loading={loading}
        loadMore={loadMore}
      >
        <VStack spacing={4} mt={6} align="stretch">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onPostUpdate={refresh} />
          ))}
        </VStack>
      </InfiniteScroll>
      
      {posts.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Heading fontSize="lg" color="gray.500">
            No posts yet. Be the first to share something!
          </Heading>
        </Box>
      )}
    </Box>
  );
};
