# Online Judge API Documentation

## Overview

This is the comprehensive API documentation for the Online Judge backend. The API provides endpoints for user management, problem solving, contest participation, and platform administration.

**Base URL:** `http://localhost:5000/api`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "data": {},
  "message": "Optional message",
  "count": "Number of items (for lists)",
  "pagination": {
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "testuser",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "user"
    }
  }
}
```

### Login User
**POST** `/auth/login`

Login with existing credentials.

**Request Body:**
```json
{
  "login": "testuser", // username or email
  "password": "password123"
}
```

### Get Current User
**GET** `/auth/me`
*Requires authentication*

Get current user information.

---

## User Management Endpoints

### Get User Profile
**GET** `/users/:id`
*Optional authentication*

Get user profile information.

### Update User Profile
**PUT** `/users/:id`
*Requires authentication (own profile only)*

Update user profile.

**Request Body:**
```json
{
  "firstName": "Updated Name",
  "bio": "My bio",
  "country": "USA",
  "institution": "University"
}
```

### Get Leaderboard
**GET** `/users/leaderboard`

Get global user leaderboard.

**Query Parameters:**
- `type`: `rating|problems|submissions` (default: rating)
- `limit`: number (default: 100)
- `page`: number (default: 1)

---

## Problem Management Endpoints

### Get All Problems
**GET** `/problems`
*Optional authentication*

Get list of published problems.

**Query Parameters:**
- `difficulty`: `Easy|Medium|Hard`
- `tags`: comma-separated list
- `search`: search term
- `limit`: number (default: 20)
- `page`: number (default: 1)
- `sortBy`: field name (default: createdAt)
- `sortOrder`: `asc|desc` (default: desc)

### Get Problem Details
**GET** `/problems/:id`
*Optional authentication*

Get detailed problem information including description, constraints, and sample test cases.

### Create Problem
**POST** `/problems`
*Requires authentication (admin/moderator only)*

Create a new problem.

**Request Body:**
```json
{
  "title": "Two Sum",
  "description": "Problem description...",
  "inputFormat": "Input format description",
  "outputFormat": "Output format description",
  "constraints": "1 <= n <= 1000",
  "difficulty": "Easy",
  "timeLimit": 1000,
  "memoryLimit": 256,
  "tags": ["array", "hash-table"],
  "sampleTestCases": [
    {
      "input": "2 7 11 15\n9",
      "output": "0 1",
      "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
    }
  ]
}
```

### Submit Solution
**POST** `/problems/:id/submit`
*Requires authentication*

Submit a solution to a problem.

**Request Body:**
```json
{
  "code": "def solution():\n    return 42",
  "language": "python"
}
```

---

## Contest Management Endpoints

### Get All Contests
**GET** `/contests`
*Optional authentication*

Get list of contests.

**Query Parameters:**
- `status`: `upcoming|running|ended`
- `type`: contest type
- `difficulty`: contest difficulty
- `search`: search term

### Get Contest Details
**GET** `/contests/:id`
*Optional authentication*

Get detailed contest information.

### Create Contest
**POST** `/contests`
*Requires authentication (admin/moderator only)*

Create a new contest.

**Request Body:**
```json
{
  "title": "Weekly Contest 1",
  "description": "Contest description",
  "type": "ICPC",
  "difficulty": "Intermediate",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-01T02:00:00Z",
  "duration": 120,
  "problems": [
    {
      "problem": "problem_id",
      "label": "A",
      "points": 100
    }
  ],
  "registrationStart": "2023-12-25T00:00:00Z",
  "registrationEnd": "2024-01-01T00:00:00Z"
}
```

### Register for Contest
**POST** `/contests/:id/register`
*Requires authentication*

Register for a contest.

### Get Contest Leaderboard
**GET** `/contests/:id/leaderboard`
*Optional authentication*

Get contest leaderboard.

### Get Contest Problems
**GET** `/contests/:id/problems`
*Requires authentication (registered participants only)*

Get problems for a contest.

### Submit Solution During Contest
**POST** `/contests/:contestId/problems/:problemId/submit`
*Requires authentication (registered participants only)*

Submit a solution during a contest.

---

## Submission Endpoints

### Get Submissions
**GET** `/submissions`
*Requires authentication*

Get user's submissions.

**Query Parameters:**
- `problemId`: filter by problem
- `contestId`: filter by contest
- `status`: filter by status
- `language`: filter by language

### Get Submission Details
**GET** `/submissions/:id`
*Requires authentication*

Get detailed submission information.

---

## Admin Panel Endpoints

All admin endpoints require admin role authentication.

### Get Admin Dashboard
**GET** `/admin/dashboard`

Get admin dashboard statistics.

### Get All Users (Admin)
**GET** `/admin/users`

Get all users for admin management.

### Update User Role
**PUT** `/admin/users/:id/role`

Update user role.

**Request Body:**
```json
{
  "role": "admin|moderator|user"
}
```

### Update User Status
**PUT** `/admin/users/:id/status`

Activate/deactivate user account.

**Request Body:**
```json
{
  "isActive": true
}
```

### Get All Problems (Admin)
**GET** `/admin/problems`

Get all problems for admin management.

### Update Problem Status
**PUT** `/admin/problems/:id/status`

Update problem status.

**Request Body:**
```json
{
  "status": "draft|published|archived"
}
```

### Rejudge Submission
**POST** `/admin/submissions/:id/rejudge`

Queue submission for rejudging.

### Get System Health
**GET** `/admin/system/health`

Get system health status.

### Get System Logs
**GET** `/admin/system/logs`

Get system logs.

**Query Parameters:**
- `level`: `error|info|debug` (default: error)
- `limit`: number (default: 100)

---

## Analytics Endpoints

### Get Public Statistics
**GET** `/analytics/public`

Get public platform statistics.

### Get User Analytics
**GET** `/analytics/user/:id`
*Requires authentication (own data or admin)*

Get detailed user analytics and statistics.

### Get Problem Statistics
**GET** `/analytics/problems`
*Requires authentication*

Get problem statistics.

### Get Contest Statistics
**GET** `/analytics/contests`
*Requires authentication*

Get contest statistics.

### Get Language Statistics
**GET** `/analytics/language-stats`

Get programming language usage statistics.

### Get Leaderboard Analytics
**GET** `/analytics/leaderboard`

Get leaderboard analytics.

### Track Event
**POST** `/analytics/track`
*Optional authentication*

Track custom analytics event.

**Request Body:**
```json
{
  "event": "problem_viewed",
  "data": {
    "problemId": "123",
    "category": "array"
  }
}
```

---

## Utility Endpoints

### Health Check
**GET** `/health`

Check server health status.

### API Status
**GET** `/api/status`

Get API status and available endpoints.

---

## Error Handling

The API uses standard HTTP status codes and returns error messages in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

## Real-time Features

The API supports WebSocket connections for real-time features:

**Connection:** `ws://localhost:5000`

**Events:**
- `submission-result`: Real-time submission results
- `contest-update`: Contest status updates
- `leaderboard-update`: Live leaderboard updates
- `new-clarification`: Contest clarification notifications

## Environment Variables

Required environment variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/onlinejudge
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
RABBITMQ_URL=amqp://localhost:5672
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Testing

Use tools like Postman, Thunder Client, or curl to test the API endpoints.

Example curl command:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "testuser", "password": "password123"}'
```

## Support

For API support and questions, contact the development team or create an issue in the project repository.
