// Auth feature exports
export { AuthPage } from './AuthPage';
export { useAuth } from './useAuth';
export { default as cognitoAuthConfig } from './oidcConfig';

// Auth utilities
export { 
  performLogout, 
  initiateLogin, 
  isAuthenticated, 
  getUserDisplayName, 
  getUserEmail, 
  handleAuthError 
} from './authUtils';
