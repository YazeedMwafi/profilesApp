import { Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Text } from "@chakra-ui/react";

export const ProtectedRoute = ({ children, roles = [] }) => {
  const auth = useAuth();

  if (auth.isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  // In a real app, you would check the user's roles from the token
  // For now, we'll just check if the email contains "admin" for demo purposes
  const userRoles = auth.user?.profile.email.includes("admin") ? ["admin"] : [];

  if (roles.length > 0 && !roles.some((role) => userRoles.includes(role))) {
    return <Navigate to="/" />;
  }

  return children;
};
