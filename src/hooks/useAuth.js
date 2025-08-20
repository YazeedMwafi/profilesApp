import { useAuth as useOidcAuth } from 'react-oidc-context';

export const useAuth = () => {
  const auth = useOidcAuth();
  
  const getCurrentUser = () => {
    if (!auth.isAuthenticated || !auth.user) return null;
    
    return {
      id: auth.user.profile.sub,
      name: auth.user.profile.name || auth.user.profile.email,
      email: auth.user.profile.email,
      profile: auth.user.profile,
    };
  };

  const isUserPost = (authorId) => {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.id === authorId;
  };

  const hasLikedPost = (post) => {
    const currentUser = getCurrentUser();
    return currentUser && post.likedBy && post.likedBy.includes(currentUser.id);
  };

  return {
    ...auth,
    getCurrentUser,
    isUserPost,
    hasLikedPost,
  };
};
