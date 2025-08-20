import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
} from "@chakra-ui/react";
import { useApiClient } from "./useApiClient";

export const EditPostModal = ({ isOpen, onClose, post, onPostUpdated }) => {
  const [content, setContent] = useState(post?.content || "");
  const [tags, setTags] = useState(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const apiClient = useApiClient();
  const toast = useToast();

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      await apiClient.updatePost(post._id, {
        content: content.trim(),
        tags: tags,
      });

      toast({
        title: "Post updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onPostUpdated) {
        onPostUpdated();
      }
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error updating post",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal opens/closes
  useState(() => {
    if (isOpen && post) {
      setContent(post.content || "");
      setTags(post.tags || []);
      setTagInput("");
    }
  }, [isOpen, post]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Content</FormLabel>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Tags</FormLabel>
            <Flex>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                mr={2}
              />
              <Button onClick={addTag} type="button">
                Add
              </Button>
            </Flex>
            <Flex mt={2} wrap="wrap">
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  size="md"
                  variant="solid"
                  colorScheme="blue"
                  mr={2}
                  mb={2}
                >
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => removeTag(tag)} />
                </Tag>
              ))}
            </Flex>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="outline" 
            colorScheme="gray"
            mr={3} 
            onClick={onClose}
            _hover={{ bg: 'gray.50' }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="teal"
            variant="solid"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Updating..."
            isDisabled={!content.trim()}
            _hover={{ bg: 'teal.600', transform: 'translateY(-1px)', boxShadow: 'lg' }}
            _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
          >
            Update Post
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
