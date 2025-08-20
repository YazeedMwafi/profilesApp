import {
  Box,
  Heading,
  Text,
  Flex,
  Avatar,
  Badge,
  IconButton,
  Divider,
  useColorModeValue,
  Input,
  Button,
  VStack,
  useDisclosure,
  Collapse,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaComment, FaEllipsisV, FaEdit } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useApiClient } from "./useApiClient";
import { EditPostModal } from "./EditPostModal";

export const PostCard = ({ post, onPostUpdate }) => {
  const bg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const { getCurrentUser, hasLikedPost, isUserPost } = useAuth();
  const { isOpen, onToggle } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const apiClient = useApiClient();

  const currentUser = getCurrentUser();
  const userHasLiked = hasLikedPost(post);
  const isOwner = isUserPost(post.authorId);

  const handleLikeToggle = async () => {
    if (!currentUser || isTogglingLike) return;
    
    setIsTogglingLike(true);
    try {
      if (userHasLiked) await apiClient.unlikePost(post._id);
      else await apiClient.likePost(post._id);

      onPostUpdate?.();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await apiClient.addComment(post._id, { content: commentText.trim() });
      setCommentText('');
      onPostUpdate?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} boxShadow="md" bg={bg} borderColor={borderColor}>
      {/* Post Header */}
      <Flex align="center" mb={2}>
        <Avatar name={post.author} mr={3} />
        <Box flex={1}>
          <Heading size="sm">{post.author}</Heading>
          <Text fontSize="xs" color={textColor}>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Text>
        </Box>
        {isOwner && (
          <Menu>
            <MenuButton as={IconButton} icon={<FaEllipsisV />} variant="ghost" size="sm" aria-label="Post options" colorScheme="gray" _hover={{ color: 'gray.600', bg: 'gray.100', transform: 'scale(1.05)' }} />
            <MenuList>
              <MenuItem icon={<FaEdit />} onClick={onEditOpen} _hover={{ bg: 'teal.50', color: 'teal.600' }}>Edit Post</MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

      {/* Post Content */}
      <Text my={3} ml={1}>{post.content}</Text>

      {/* Tags */}
      <Flex mb={3} flexWrap="wrap">
        {post.tags.map((tag) => (
          <Badge key={tag} colorScheme="blue" mr={2} mb={1}>
            #{tag}
          </Badge>
        ))}
      </Flex>

      <HStack mb={3} spacing={6}>
        {/* Likes */}
        <HStack spacing={1}>
          <IconButton
            icon={userHasLiked ? <FaHeart color="red" /> : <FaRegHeart color="red" />}
            aria-label="Like post"
            variant="ghost"
            colorScheme="red"
            size="sm"
            onClick={handleLikeToggle}
            isLoading={isTogglingLike}
            isDisabled={!currentUser}
            bg="transparent"
            _hover={{ 
              transform: 'scale(1.2)', 
              bg: 'transparent',
              transition: 'all 0.2s' 
            }}
            _active={{ transform: 'scale(1.3)' }}
            _focus={{ boxShadow: 'none' }}
          />
          <Text fontSize="sm" fontWeight="medium">{post.likesCount || 0}</Text>
        </HStack>

        <HStack spacing={1}>
          <IconButton
            icon={<FaComment />}
            aria-label="Comment on post"
            variant="ghost"
            colorScheme="blue"
            size="sm"
            onClick={onToggle}
            _hover={{ transform: 'scale(1.2)', color: 'blue.500', transition: 'all 0.2s' }}
            _active={{ transform: 'scale(1.3)' }}
            _focus={{ boxShadow: 'none' }}
          />
          <Text fontSize="sm" fontWeight="medium">{post.comments?.length || 0}</Text>
        </HStack>
      </HStack>

      <Collapse in={isOpen} animateOpacity>
        <Divider mb={3} />
        {currentUser && (
          <Flex mb={3}>
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              size="sm"
              mr={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleAddComment}
              isLoading={isSubmittingComment}
              isDisabled={!commentText.trim()}
              _hover={{ bg: 'blue.600', transform: 'scale(1.02)' }}
              _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
            >
              Post
            </Button>
          </Flex>
        )}
        <VStack spacing={2} align="stretch">
          {post.comments?.length > 0 ? post.comments.map((comment) => (
            <Box key={comment._id || comment.id} p={2} borderRadius="md">
              <Flex align="start">
                <Avatar name={comment.author} size="xs" mr={2} />
                <Box flex={1}>
                  <Flex align="center" mb={1}>
                    <Text fontWeight="bold" fontSize="sm" mr={2}>{comment.author}</Text>
                    <Text fontSize="xs" color={textColor}>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</Text>
                  </Flex>
                  <Text fontSize="sm">{comment.content}</Text>
                </Box>
              </Flex>
            </Box>
          )) : (
            <Text fontSize="sm" color={textColor} textAlign="center" py={2}>No comments yet.</Text>
          )}
        </VStack>
      </Collapse>

      <EditPostModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        post={post}
        onPostUpdated={onPostUpdate}
      />
    </Box>
  );
};
