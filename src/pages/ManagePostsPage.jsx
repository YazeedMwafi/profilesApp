import {
  Box,
  Heading,
  VStack,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { PostCard } from "../components/PostCard";
import { usePosts } from "../hooks/usePosts";

export const ManagePostsPage = () => {
  const { posts, loading, error, deletePost, refreshPosts } = usePosts();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postToDelete, setPostToDelete] = useState(null);
  const cancelRef = useRef();

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    onOpen();
  };

  const handleConfirmDelete = async () => {
    if (postToDelete) {
      try {
        await deletePost(postToDelete._id);
        onClose();
        setPostToDelete(null);
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Heading mt={4} fontSize="lg">Loading posts...</Heading>
      </Box>
    );
  }

  return (
    <Box>
      <Heading mb={6}>Manage Posts</Heading>
      
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <Alert status="info" mb={4}>
        <AlertIcon />
        As an admin, you can delete any post.
      </Alert>
      
      <VStack spacing={4} align="stretch">
        {posts.map((post) => (
          <Box key={post._id} position="relative">
            <PostCard post={post} onPostUpdate={refreshPosts} />
            <Button
              colorScheme="red"
              size="sm"
              position="absolute"
              top={4}
              right={4}
              onClick={() => handleDeleteClick(post)}
            >
              Delete
            </Button>
          </Box>
        ))}
      </VStack>
      
      {posts.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Heading fontSize="lg" color="gray.500">
            No posts to manage.
          </Heading>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Post
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
