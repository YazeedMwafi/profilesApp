# API Integration Guide

## Overview

This frontend is now fully integrated with your AWS Lambda backend API. All mock data has been replaced with real API calls to your AWS API Gateway endpoint.

## API Configuration

- **Base URL**: `https://qi1mzemdhk.execute-api.eu-central-1.amazonaws.com`
- **Authentication**: Cognito JWT tokens via OIDC
- **Endpoints**: All backend routes are supported

## Files Created/Modified

### New Files:

1. **`/services/apiClient.js`** - Main API client with all HTTP methods
2. **`/hooks/usePosts.js`** - React hook for posts management
3. **`/hooks/useAuth.js`** - Enhanced auth hook with user utilities
4. **`/config/api.js`** - API configuration
5. **`/components/ApiTester.jsx`** - Testing component for API verification

### Modified Files:

1. **`/pages/HomePage.jsx`** - Now fetches real posts and creates posts via API
2. **`/pages/ManagePostsPage.jsx`** - Uses API for post deletion with confirmation
3. **`/components/PostCard.jsx`** - Interactive likes and comments with real API

## API Endpoints Supported

### Public Endpoints (no authentication required):

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post

### Protected Endpoints (require `Authorization: Bearer <id_token>` header):

- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post (owner only)
- `DELETE /api/posts/:id` - Delete post (owner only)
- `POST /api/posts/:id/comments` - Add comment
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/unlike` - Unlike post
- `GET /api/protected` - Test protected route

**Note**: The API client automatically adds the `Authorization: Bearer <id_token>` header to all non-GET requests when the user is authenticated.

## Features Implemented

### ✅ Post Management

- Create new posts with content and tags
- View all posts with real-time data
- Delete posts (admin functionality)
- Proper error handling and loading states

### ✅ Interactive Features

- Like/unlike posts with real-time updates
- Add comments to posts
- Expandable comment sections
- User authentication integration

### ✅ Authentication Integration

- Automatic JWT token handling
- User context for post ownership
- Protected routes and actions
- Token refresh handling

### ✅ Error Handling

- Network error handling
- Authentication error handling
- User-friendly error messages
- Loading states for all operations

## How to Test

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Login with your Cognito account**
   - The app will redirect to Cognito login
   - After login, you'll be redirected back to the app

3. **Test API Connection**:
   - Temporarily add the ApiTester component to your app:

   ```jsx
   import { ApiTester } from "./components/ApiTester";

   // Add to your route or component
   <ApiTester />;
   ```

4. **Test Core Functionality**:
   - Create a new post
   - Like/unlike posts
   - Add comments
   - Delete posts (if admin)

## Authentication Flow

1. User logs in via Cognito OIDC
2. JWT ID token is stored in localStorage
3. API client automatically includes `Authorization: Bearer <id_token>` header for non-GET requests
4. Backend validates token and extracts user info
5. User-specific operations (like, comment, delete) work properly

## Error Scenarios Handled

- **Network failures**: Toast notifications with retry options
- **Authentication failures**: Automatic redirect to login
- **Authorization failures**: User-friendly error messages
- **Validation errors**: Form-level error handling
- **Server errors**: Graceful degradation with error messages

## Data Mapping

Your backend uses MongoDB ObjectIds (`_id`) while the frontend previously used simple `id` fields. The integration handles both:

- Post IDs: Uses `post._id` from backend
- Comments: Maps to `comment._id` or falls back to `comment.id`
- Likes: Uses `post.likesCount` and `post.likedBy` array
- User identification: Maps `user.sub` from Cognito to `authorId`

## Configuration

To change the API endpoint, update `/config/api.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: "https://your-api-gateway-url.amazonaws.com",
  // ... other config
};
```

## Next Steps

1. **Remove Mock Data**: The `/data/posts.js` file is no longer needed
2. **Add Error Boundaries**: Consider adding React error boundaries
3. **Add Offline Support**: Implement service worker for offline functionality
4. **Add Real-time Updates**: Consider WebSocket integration for live updates
5. **Add Image Upload**: Extend posts to support image attachments
6. **Add Search**: Implement post search functionality
7. **Add Pagination**: For better performance with large datasets

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure your Lambda function has proper CORS headers
   - Check API Gateway CORS configuration

2. **Authentication Failures**:
   - Verify Cognito configuration matches your setup
   - Check token expiration and refresh logic

3. **Network Errors**:
   - Verify API Gateway URL is correct
   - Check Lambda function is deployed and running
   - Verify database connection in Lambda

4. **Data Format Issues**:
   - Ensure backend returns data in expected format
   - Check date formatting and field names

### Debug Tools:

1. Use the ApiTester component to verify connectivity
2. Check browser Network tab for request/response details
3. Check browser Console for JavaScript errors
4. Use CloudWatch logs to debug Lambda function issues

## Security Considerations

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- All protected endpoints require valid authentication
- User authorization is handled at the backend level
- CORS is configured for your domain only

The integration is now complete and ready for use! 🚀
