// src/pages/MFAManagementPage.jsx
import { MFASetup } from "../components/MFASetup";
import { Box, Heading, Button, VStack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const MFAManagementPage = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate("/"); // Redirect to home after MFA setup
  };

  return (
    <Box p={8} maxW="container.md" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Security Settings</Heading>
        <Text>Manage your multi-factor authentication preferences:</Text>
        <MFASetup onComplete={handleComplete} />
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Home
        </Button>
      </VStack>
    </Box>
  );
};