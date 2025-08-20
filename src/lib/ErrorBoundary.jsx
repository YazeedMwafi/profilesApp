import React from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Here you could send error to a logging service like Sentry
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
          bg="gray.50"
        >
          <VStack spacing={6} maxW="md" textAlign="center">
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              Something went wrong
            </Alert>
            
            <Heading size="lg" color="red.600">
              Oops! Something broke
            </Heading>
            
            <Text color="gray.600">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </Text>
            
            <VStack spacing={3}>
              <Button
                colorScheme="blue"
                onClick={this.handleRetry}
                size="lg"
                bg="blue.500"
                color="white"
                _hover={{ bg: 'blue.600' }}
              >
                Refresh Page
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                size="md"
              >
                Go Back
              </Button>
            </VStack>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                mt={4}
                p={4}
                bg="gray.100"
                borderRadius="md"
                textAlign="left"
                maxH="200px"
                overflow="auto"
              >
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  Error Details (Development):
                </Text>
                <Text fontSize="xs" fontFamily="mono">
                  {this.state.error.toString()}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
