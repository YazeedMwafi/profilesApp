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
  Heading 
} from "@chakra-ui/react";
// No routing here; redirection is handled in App.jsx route for /auth

export const AuthPage = () => {
  const auth = useAuth();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

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
      console.error('Auth error:', params.get('error_description'));
      return;
    }

    // Do NOT auto-redirect to login; show a Sign In button instead
  }, [auth]);

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
          onClick={() => auth.signinRedirect()}
        >
          Try Again
        </Button>
      </Flex>
    );
  }

  if (showLogoutMessage) {
    return (
      <Flex direction="column" align="center" justify="center" minH="100vh" p={4}>
        <Alert status="success" mb={4} maxW="md">
          <AlertIcon />
          You have been successfully logged out.
        </Alert>
        <Button colorScheme="blue" size="lg" onClick={() => auth.signinRedirect()}>
          Sign In
        </Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" p={4}>
      <Heading mb={6}>Please Sign In</Heading>
      <Button
        colorScheme="blue"
        size="lg"
        onClick={() => auth.signinRedirect()}
      >
        Sign In
      </Button>
    </Flex>
  );
};