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
} from "@chakra-ui/react";

export const PostForm = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ content, tags });
    setContent("");
    setTags([]);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
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
      p={4}
      borderWidth="1px"
      borderRadius="lg"
    >
      <FormControl mb={4}>
        <FormLabel>What's on your mind?</FormLabel>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post here..."
          required
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

      <Button type="submit" colorScheme="blue">
        Post
      </Button>
    </Box>
  );
};
