import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  Flex,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";

export const PostForm = ({ onSubmit, maxContentLength = 500 }) => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const contentColor = useColorModeValue("gray.700", "gray.200");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content: content.trim(), tags });
    setContent("");
    setTags([]);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
      bg={useColorModeValue("white", "gray.700")}
    >
      <VStack spacing={4} align="stretch">
        {/* Post Content */}
        <FormControl>
          <FormLabel>What's on your mind?</FormLabel>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here..."
            resize="vertical"
            maxLength={maxContentLength}
            focusBorderColor="blue.400"
          />
          <Text fontSize="sm" color="gray.500" mt={1} textAlign="right">
            {content.length}/{maxContentLength}
          </Text>
        </FormControl>

        {/* Tags Input */}
        <FormControl>
          <FormLabel>Tags</FormLabel>
          <Flex>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              mr={2}
              focusBorderColor="blue.400"
            />
            <Button
              onClick={addTag}
              type="button"
              colorScheme="blue"
              _hover={{ bg: "blue.600", transform: "translateY(-1px)" }}
            >
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
                borderRadius="full"
                cursor="default"
                _hover={{ opacity: 0.85 }}
              >
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => removeTag(tag)} />
              </Tag>
            ))}
          </Flex>
        </FormControl>

        {/* Submit Button */}
        <Button
          type="submit"
          colorScheme="blue"
          bg="blue.400"
          variant="solid"
          size="md"
          isDisabled={!content.trim()}
          _hover={{ bg: "blue.600", transform: "translateY(-1px)", boxShadow: "lg" }}
          _active={{ transform: "translateY(0)" }}
        >
          Share Post
        </Button>
      </VStack>
    </Box>
  );
};
