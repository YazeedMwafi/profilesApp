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
} from "@chakra-ui/react";
import { Spacer } from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaComment, FaEllipsisV, FaEdit } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useApiClient } from "../hooks/useApiClient";
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
      if (userHasLiked) {
        await apiClient.unlikePost(post._id);
      } else {
        await apiClient.likePost(post._id);
      }
      // Trigger parent component to refetch data
      if (onPostUpdate) {
        onPostUpdate();
      }
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
      // Trigger parent component to refetch data
      if (onPostUpdate) {
        onPostUpdate();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      mb={4}
      boxShadow="md"
      bg={bg}
      borderColor={borderColor}
    >
      <Flex align="center" mb={2}>
        <Avatar
          name={post.author}
          mr={3}
        />
        <Box flex={1}>
          <Heading size="sm">{post.author}</Heading>
          <Text fontSize="xs" color={textColor}>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Text>
        </Box>
        
        {isOwner && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size="sm"
              aria-label="Post options"
            />
            <MenuList>
              <MenuItem icon={<FaEdit />} onClick={onEditOpen}>
                Edit Post
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

      <Text mb={3}>{post.content}</Text>

      <Flex mb={3}>
        {post.tags.map((tag) => (
          <Badge key={tag} colorScheme="blue" mr={2} mb={1}>
            #{tag}
          </Badge>
        ))}
      </Flex>

      <Flex align="center" mb={3}>
        <IconButton
          icon={userHasLiked ? <FaHeart color="red" /> : <FaRegHeart />}
          aria-label="Like post"
          variant="ghost"
          size="sm"
          mr={1}
          onClick={handleLikeToggle}
          isLoading={isTogglingLike}
          isDisabled={!currentUser}
        />
        <Text fontSize="sm" mr={3}>
          {post.likesCount || 0}
        </Text>

        <IconButton
          icon={<FaComment />}
          aria-label="Comment on post"
          variant="ghost"
          size="sm"
          mr={1}
          onClick={onToggle}
        />
        <Text fontSize="sm">{post.comments?.length || 0}</Text>
      </Flex>

      {/* Comments Section */}
      <Collapse in={isOpen} animateOpacity>
        <Divider mb={3} />
        
        {/* Add Comment Form */}
        {currentUser && (
          <Box mb={3}>
            <Flex>
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
              >
                Post
              </Button>
            </Flex>
          </Box>
        )}

        {/* Comments List */}
        <VStack spacing={2} align="stretch">
          {post.comments?.map((comment) => (
            <Box key={comment._id || comment.id} p={2} bg={useColorModeValue('gray.50', 'gray.600')} borderRadius="md">
              <Flex align="start">
                <Avatar
                  name={comment.author}
                  size="xs"
                  mr={2}
                />
                <Box flex={1}>
                  <Flex align="center" mb={1}>
                    <Text fontWeight="bold" fontSize="sm" mr={2}>
                      {comment.author}
                    </Text>
                    <Text fontSize="xs" color={textColor}>
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </Text>
                  </Flex>
                  <Text fontSize="sm">{comment.content}</Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </VStack>
        
        {post.comments?.length === 0 && (
          <Text fontSize="sm" color={textColor} textAlign="center" py={2}>
            No comments yet. Be the first to comment!
          </Text>
        )}
      </Collapse>

      {/* Show comments preview when collapsed */}
      {!isOpen && post.comments?.length > 0 && (
        <>
          <Divider mb={3} />
          {post.comments.slice(0, 2).map((comment) => (
            <Box key={comment._id || comment.id} mb={2}>
              <Flex align="center">
                <Avatar
                  name={comment.author}
                  size="xs"
                  mr={2}
                />
                <Box>
                  <Text fontWeight="bold" fontSize="sm">
                    {comment.author}
                  </Text>
                  <Text fontSize="sm">{comment.content}</Text>
                </Box>
              </Flex>
            </Box>
          ))}
          {post.comments.length > 2 && (
            <Text fontSize="sm" color={textColor} cursor="pointer" onClick={onToggle}>
              +{post.comments.length - 2} more comments
            </Text>
          )}
        </>
      )}
      
      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        post={post}
        onPostUpdated={onPostUpdate}
      />
    </Box>
  );
};
