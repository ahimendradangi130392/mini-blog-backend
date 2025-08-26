# Backend API - Mini Blog

A Node.js/Express.js REST API backend for a mini blog application with user authentication, posts, comments, and social features.

## Features

- **User Authentication**: JWT-based signup, login, and user management
- **Posts Management**: Create, read, update, delete posts with pagination
- **Comments System**: Nested comments with threading support
- **Social Features**: Like posts/comments, repost functionality
- **User Mentions**: @username mentions in posts and comments
- **Search & Pagination**: User search and paginated responses
- **Error Handling**: Comprehensive error handling and validation
- **Security**: JWT authentication, input validation, rate limiting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi schema validation
- **Testing**: Jest testing framework
- **Language**: TypeScript

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy `.env.example` to `.env`
   - Update the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mini-blog
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

4. **Database Setup:**
   - Ensure MongoDB is running
   - The application will automatically create the database and collections on first run

## Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm run build
npm start
```

### Build Only
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Toggle post like
- `POST /api/posts/:id/repost` - Repost
- `GET /api/posts/mention/:username` - Get posts mentioning user

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/username/:username` - Get user by username
- `GET /api/users/:id/posts` - Get user's posts
- `GET /api/users/username/:username/posts` - Get posts by username
- `GET /api/users/search` - Search users

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/post/:postId` - Get comments for post
- `POST /api/comments/:id/like` - Toggle comment like
- `DELETE /api/comments/:id` - Delete comment

### Health Check
- `GET /api/health` - API health status

## Database Schema

### User Model
```typescript
{
  username: string (unique, required)
  email: string (unique, required)
  password: string (hashed, required)
  createdAt: Date
}
```

### Post Model
```typescript
{
  title: string (required)
  content: string (required)
  author: ObjectId (ref: User)
  likes: ObjectId[] (ref: User)
  comments: ObjectId[] (ref: Comment)
  rePosts: ObjectId[] (ref: User)
  mentions: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Comment Model
```typescript
{
  content: string (required)
  author: ObjectId (ref: User)
  post: ObjectId (ref: Post)
  parentComment: ObjectId (ref: Comment, optional)
  mentions: string[]
  likes: ObjectId[] (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Integration Tests
```bash
npm run test:integration
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/mini-blog |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `NODE_ENV` | Environment mode | development |

## Development

### Project Structure
```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── constants/       # Application constants
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── tests/               # Test files
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

### Adding New Features
1. Create model in `src/models/`
2. Add service logic in `src/services/`
3. Create controller in `src/controllers/`
4. Define routes in `src/routes/`
5. Add types in `src/types/`
6. Write tests in `tests/`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access

2. **JWT Errors**
   - Check `JWT_SECRET` is set in `.env`
   - Verify token format in Authorization header

3. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill process using the port: `lsof -ti:5000 | xargs kill`

4. **TypeScript Compilation Errors**
   - Run `npm run build` to see detailed errors
   - Check `tsconfig.json` configuration

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use TypeScript for type safety
5. Follow ESLint rules

## License

This project is licensed under the MIT License. 