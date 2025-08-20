import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage, ManagePostsPage } from "./features/posts";
import { AuthPage } from "./features/auth";
import { useAuth } from "react-oidc-context";
import { Box, Spinner, useToast, Alert, AlertIcon, Button, Flex } from "@chakra-ui/react";
import { handleAuthError } from "./features/auth";

const ProtectedRoute = ({ children, roles = [] }) => {
  const auth = useAuth();
  const toast = useToast();

  if (auth.isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  const auth = useAuth();
  const toast = useToast();

  if (auth.isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minH="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (auth.error) {
    handleAuthError(auth.error, toast);
    return (
      <Flex direction="column" align="center" justify="center" minH="100vh" p={4}>
        <Alert status="error" mb={4} maxW="md">
          <AlertIcon />
          Authentication Error: {auth.error.message}
        </Alert>
        <Button 
          colorScheme="blue"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Flex>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route
          path="manage"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManagePostsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
