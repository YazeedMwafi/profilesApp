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
  Flex,
  Text,
  Badge,
  IconButton,
  Card,
  CardBody,
  Stack,
  useColorModeValue,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaEdit, FaTrash, FaHeart, FaComment } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { useUserPosts } from "./useUserPosts";
import { useAuth } from "../auth/useAuth";
import { InfiniteScroll } from "../../lib/InfiniteScroll";
import { EditPostModal } from "./EditPostModal";

export const ManagePostsPage = () => {
  const { posts, loading, error, hasMore, loadMore, updatePost, deletePost, refresh } = useUserPosts(10);
  const { getCurrentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [postToDelete, setPostToDelete] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);
  const cancelRef = useRef();

  const currentUser = getCurrentUser();
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Calculate stats
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    onOpen();
  };

  const handleEditClick = (post) => {
    setPostToEdit(post);
    onEditOpen();
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

  const handlePostUpdated = () => {
    refresh();
    onEditClose();
  };

  if (loading && posts.length === 0) {
    return (
      <Box maxW="1200px" mx="auto" textAlign="center" py={8}>
        <Spinner size="xl" />
        <Heading mt={4} fontSize="lg">Loading your posts...</Heading>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading fontSize="2xl">My Posts</Heading>
          <Text color="gray.600" mt={1}>
            Manage and edit your posts
          </Text>
        </Box>
        {currentUser && (
          <Badge colorScheme="blue" fontSize="sm" p={2} borderRadius="md">
            {currentUser.name}
          </Badge>
        )}
      </Flex>

      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {posts.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
          <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <StatLabel>Total Posts</StatLabel>
            <StatNumber>{totalPosts}</StatNumber>
            <StatHelpText>Your published posts</StatHelpText>
          </Stat>
          <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <StatLabel>Total Likes</StatLabel>
            <StatNumber>{totalLikes}</StatNumber>
            <StatHelpText>Across all posts</StatHelpText>
          </Stat>
          <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <StatLabel>Total Comments</StatLabel>
            <StatNumber>{totalComments}</StatNumber>
            <StatHelpText>Engagement received</StatHelpText>
          </Stat>
        </SimpleGrid>
      )}

      <InfiniteScroll
        hasMore={hasMore}
        loading={loading}
        loadMore={loadMore}
      >
        <VStack spacing={4} align="stretch">
          {posts.map((post) => (
            <Card key={post._id} bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stack spacing={3}>
                  {/* Post Header */}
                  <Flex justify="space-between" align="start">
                    <Box flex={1}>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </Text>
                      <Text fontSize="md" noOfLines={3}>
                        {post.content}
                      </Text>
                    </Box>
                    <Flex gap={2} ml={4}>
                      <IconButton
                        icon={<FaEdit />}
                        size="sm"
                        variant="solid"
                        colorScheme="teal"
                        aria-label="Edit post"
                        onClick={() => handleEditClick(post)}
                        _hover={{ transform: 'scale(1.05)' }}
                      />
                      <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        variant="solid"
                        colorScheme="red"
                        aria-label="Delete post"
                        onClick={() => handleDeleteClick(post)}
                        _hover={{ transform: 'scale(1.05)' }}
                      />
                    </Flex>
                  </Flex>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <Flex wrap="wrap" gap={2}>
                      {post.tags.map((tag) => (
                        <Badge key={tag} colorScheme="blue" size="sm">
                          #{tag}
                        </Badge>
                      ))}
                    </Flex>
                  )}

                  <Divider />

                  {/* Post Stats */}
                  <Flex gap={4}>
                    <Flex align="center" gap={1}>
                      <FaHeart color="red" size={14} />
                      <Text fontSize="sm">{post.likesCount || 0}</Text>
                    </Flex>
                    <Flex align="center" gap={1}>
                      <FaComment size={14} />
                      <Text fontSize="sm">{post.comments?.length || 0}</Text>
                    </Flex>
                  </Flex>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </InfiniteScroll>

      {posts.length === 0 && !loading && (
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody textAlign="center" py={12}>
            <Box mb={4}>
              <FaEdit size={48} color="gray" />
            </Box>
            <Heading fontSize="lg" color="gray.500" mb={2}>
              No posts yet
            </Heading>
            <Text color="gray.400">
              Start sharing your thoughts by creating your first post!
            </Text>
          </CardBody>
        </Card>
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
              <Button 
                ref={cancelRef} 
                onClick={onClose}
                variant="outline"
                colorScheme="gray"
              >
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleConfirmDelete} 
                ml={3}
                variant="solid"
                _hover={{ bg: 'red.600' }}
              >
                Delete Post
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        post={postToEdit}
        onPostUpdated={handlePostUpdated}
      />
    </Box>
  );
};
