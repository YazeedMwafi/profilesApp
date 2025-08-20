// Determine if we're in production or development
const isProduction = window.location.hostname !== 'localhost';
const baseURL = isProduction 
  ? 'https://master.d23rejtqn9e2z9.amplifyapp.com'
  : 'http://localhost:5173';

const cognitoAuthConfig = {
  authority:
    "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_eFK9hgEwW",
  client_id: "64r630o8mhb1qf9i93ls4eu990",
  redirect_uri: `${baseURL}/`,
  post_logout_redirect_uri: `${baseURL}/auth`,
  response_type: "code",
  scope: "openid email phone profile",
  loadUserInfo: true,
  automaticSilentRenew: true,
  revokeTokensOnSignout: true,
  metadata: {
    issuer:
      "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_eFK9hgEwW",
    authorization_endpoint:
      "https://eu-central-1efk9hgeww.auth.eu-central-1.amazoncognito.com/oauth2/authorize",
    end_session_endpoint:
      "https://eu-central-1efk9hgeww.auth.eu-central-1.amazoncognito.com/logout",
    token_endpoint:
      "https://eu-central-1efk9hgeww.auth.eu-central-1.amazoncognito.com/oauth2/token",
    userinfo_endpoint:
      "https://eu-central-1efk9hgeww.auth.eu-central-1.amazoncognito.com/oauth2/userInfo",
    jwks_uri:
      "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_eFK9hgEwW/.well-known/jwks.json",
  },
};

export default cognitoAuthConfig;


