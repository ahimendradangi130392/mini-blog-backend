import dotenv from 'dotenv'
dotenv.config();

// API Constants
export const API_CONSTANTS = {
  VERSION: 'v1',
  BASE_PATH: '/api',
  DEFAULT_PORT: 5000,
  DEFAULT_MONGODB_URI: 'mongodb://localhost:27017/mini-blog'
} as const

// JWT Constants
export const JWT_CONSTANTS = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ALGORITHM: 'HS256'
} as const

// Validation Constants
export const VALIDATION_CONSTANTS = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6
  },
  POST: {
    TITLE_MAX_LENGTH: 100,
    CONTENT_MAX_LENGTH: 1000
  }
} as const

// Pagination Constants
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  MIN_LIMIT: 1
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  AUTHENTICATION_FAILED: 'Authentication failed',
  AUTHORIZATION_FAILED: 'Access denied',
  RESOURCE_NOT_FOUND: 'Resource not found',
  DUPLICATE_RESOURCE: 'Resource already exists',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_AUTHENTICATED: 'Login successful',
  POST_CREATED: 'Post created successfully',
  POST_UPDATED: 'Post updated successfully',
  POST_DELETED: 'Post deleted successfully',
  RESOURCE_RETRIEVED: 'Resource retrieved successfully'
} as const 