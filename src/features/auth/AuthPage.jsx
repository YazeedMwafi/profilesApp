import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { 
  Box, 
  Button, 
  Text, 
  Spinner, 
  Alert, 
  AlertIcon, 
  Flex, 
  Heading,
  VStack,
  Image,
  useToast,
  useColorModeValue
} from "@chakra-ui/react";
import { initiateLogin, handleAuthError } from "./authUtils";
import bloggerLogo from "../../assets/bloggerIcon.svg";

export const AuthPage = () => {
  const auth = useAuth();
  const toast = useToast();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const bg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    // Check URL params first
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const returningFromLogout = params.has('post_logout_redirect_uri');

    if (returningFromLogout) {
      // Clean URL and stop here
      window.history.replaceState({}, document.title, "/auth");
      return;
    }

    // Detect recent logout via session flag set in onSignoutCallback
    const justLoggedOut = sessionStorage.getItem("justLoggedOut");
    if (justLoggedOut) {
      try { sessionStorage.removeItem("justLoggedOut"); } catch {}
      setShowLogoutMessage(true);
      return;
    }

    if (error) {
      const errorDescription = params.get('error_description');
      console.error('Auth error:', errorDescription);
      handleAuthError(new Error(errorDescription || error), toast);
      return;
    }

    // Do NOT auto-redirect to login; show a Sign In button instead
  }, [auth, toast]);

  if (auth.isLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading...</Text>
      </Flex>
    );
  }

  if (auth.error) {
    return (
      <Flex direction="column" align="center" justify="center" minH="100vh" p={4}>
        <Alert status="error" mb={4} maxW="md">
          <AlertIcon />
          Login Error: {auth.error.message}
        </Alert>
        <Button 
          colorScheme="blue"
          variant="solid"
          isLoading={isLoggingIn}
          onClick={async () => {
            setIsLoggingIn(true);
            await initiateLogin(auth, toast);
            setIsLoggingIn(false);
          }}
          _hover={{ bg: 'blue.600', transform: 'scale(1.02)' }}
        >
          Try Again
        </Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" p={4} bg={bg}>
      <Box
        bg={cardBg}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        borderWidth="1px"
        borderColor={borderColor}
        maxW="md"
        w="full"
        textAlign="center"
      >
        <VStack spacing={6}>
          <Image src={bloggerLogo} alt="Logo" h="16" w="16" />
          
          <VStack spacing={2}>
            <Heading size="lg">Welcome to CloudVests</Heading>
            <Text color="gray.600">
              Sign in to share your thoughts and connect with others
            </Text>
          </VStack>

          <Button
            colorScheme="blue"
            size="lg"
            width="full"
            variant="solid"
            isLoading={isLoggingIn}
            loadingText="Signing in..."
            onClick={async () => {
              setIsLoggingIn(true);
              await initiateLogin(auth, toast);
              setIsLoggingIn(false);
            }}
            _hover={{ 
              bg: 'blue.600', 
              transform: 'translateY(-2px)', 
              boxShadow: 'xl' 
            }}
            _active={{ transform: 'translateY(0)' }}
          >
            Sign In with AWS Cognito
          </Button>

          <Text fontSize="sm" color="gray.500">
            Secure authentication powered by AWS
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};