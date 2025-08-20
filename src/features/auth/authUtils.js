/**
 * Authentication utilities for handling login/logout operations
 */

/**
 * Performs a complete logout with proper cleanup using direct Cognito URL
 * @param {Object} auth - The OIDC auth context
 * @param {Function} toast - Chakra UI toast function (optional)
 * @returns {Promise<void>}
 */
export const performLogout = async (auth, toast = null) => {
  try {
    // Show loading state
    if (toast) {
      toast({
        title: 'Signing out...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }

    // Remove user from OIDC context first
    if (auth && auth.removeUser) {
      await auth.removeUser();
    }

    // Build the direct Cognito logout URL
    const logoutUrl = new URL(
      "https://eu-central-1efk9hgeww.auth.eu-central-1.amazoncognito.com/logout"
    );
    logoutUrl.searchParams.set("client_id", "64r630o8mhb1qf9i93ls4eu990");
    logoutUrl.searchParams.set("logout_uri", window.location.origin + "/auth");
    
    // Add id_token_hint if available for better logout
    if (auth?.user?.id_token) {
      logoutUrl.searchParams.set("id_token_hint", auth.user.id_token);
    }

    // Clear all storage and set logout flag
    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("justLoggedOut", "1");
    } catch (storageError) {
      console.warn('Storage clearing failed:', storageError);
    }

    // Redirect to Cognito logout URL
    window.location.href = logoutUrl.toString();

  } catch (error) {
    console.error("Logout failed:", error);
    
    // Fallback logout procedure
    try {
      // Clear all storage as fallback
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("justLoggedOut", "1");
      
      if (toast) {
        toast({
          title: 'Signed out',
          description: 'You have been logged out (fallback method)',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Direct redirect to auth page
      window.location.href = '/auth';
      
    } catch (fallbackError) {
      console.error('Fallback logout also failed:', fallbackError);
      
      if (toast) {
        toast({
          title: 'Logout Error',
          description: 'Please close your browser to complete logout',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Last resort - reload the page
      window.location.reload();
    }
  }
};

/**
 * Handles login initiation with proper error handling
 * @param {Object} auth - The OIDC auth context
 * @param {Function} toast - Chakra UI toast function (optional)
 * @returns {Promise<void>}
 */
export const initiateLogin = async (auth, toast = null) => {
  try {
    if (toast) {
      toast({
        title: 'Redirecting to login...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }

    if (auth && auth.signinRedirect) {
      await auth.signinRedirect();
    } else {
      throw new Error('Auth context not available');
    }

  } catch (error) {
    console.error('Login initiation error:', error);
    
    if (toast) {
      toast({
        title: 'Login Error',
        description: 'Unable to start login process. Please refresh and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }
};

/**
 * Checks if user is properly authenticated
 * @param {Object} auth - The OIDC auth context
 * @returns {boolean}
 */
export const isAuthenticated = (auth) => {
  return !!(
    auth && 
    auth.isAuthenticated && 
    auth.user && 
    auth.user.id_token &&
    !auth.isLoading
  );
};

/**
 * Gets user display name from auth context
 * @param {Object} auth - The OIDC auth context
 * @returns {string}
 */
export const getUserDisplayName = (auth) => {
  if (!isAuthenticated(auth)) return '';
  
  const user = auth.user;
  const profile = user.profile || user;
  
  return profile.name || 
         profile.given_name || 
         profile.preferred_username || 
         profile.email?.split("@")[0] || 
         user.name ||
         user.given_name ||
         user.email?.split("@")[0] ||
         'User';
};

/**
 * Gets user email from auth context
 * @param {Object} auth - The OIDC auth context
 * @returns {string}
 */
export const getUserEmail = (auth) => {
  if (!isAuthenticated(auth)) return '';
  const user = auth.user;
  const profile = user.profile || user;
  return profile.email || user.email || '';
};

/**
 * Handles auth errors with user-friendly messages
 * @param {Error} error - The error object
 * @param {Function} toast - Chakra UI toast function
 */
export const handleAuthError = (error, toast) => {
  console.error('Authentication error:', error);
  
  let title = 'Authentication Error';
  let description = 'An unexpected error occurred';
  
  if (error.message.includes('network') || error.message.includes('fetch')) {
    title = 'Network Error';
    description = 'Please check your internet connection and try again';
  } else if (error.message.includes('token')) {
    title = 'Session Expired';
    description = 'Please log in again';
  } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
    title = 'Unauthorized';
    description = 'Your session has expired. Please log in again';
  }
  
  if (toast) {
    toast({
      title,
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }
};
