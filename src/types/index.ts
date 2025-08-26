import { Request } from 'express'
import { Document } from 'mongoose'

// Base interfaces
export interface BaseDocument extends Document {
  createdAt: Date
  updatedAt: Date
}

// User types
export interface IUser extends BaseDocument {
  username: string
  email: string
  password: string
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface IUserResponse {
  _id: string
  username: string
  email: string
  createdAt: Date
}

// Post types
export interface IPost extends BaseDocument {
  title: string
  content: string
  author: string | IUser
}

export interface IPostResponse {
  _id: string
  title: string
  content: string
  author: IUserResponse
  likes: string[]
  comments: string[]
  rePosts: string[]
  mentions: string[]
  createdAt: Date
  updatedAt: Date
}

// Auth types
export interface IAuthRequest extends Request {
  user?: IUserResponse
}

export interface ILoginCredentials {
  email: string
  password: string
}

export interface ISignupCredentials {
  username: string
  email: string
  password: string
}

export interface IAuthResponse {
  message: string
  token: string
  user: IUserResponse
  success: boolean
}

// API Response types
export interface IApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Array<{ field: string; message: string }>
}

// Pagination types
export interface IPaginationQuery {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface IPaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Validation types
export interface IValidationError {
  field: string
  message: string
}

// Service types
export interface IUserService {
  createUser(userData: ISignupCredentials): Promise<IUserResponse>
  findUserByEmail(email: string): Promise<IUser | null>
  findUserById(id: string): Promise<IUserResponse | null>
  getAllUsers(pagination: IPaginationQuery): Promise<IPaginatedResponse<IUserResponse>>
  getUserPosts(userId: string, pagination: IPaginationQuery): Promise<IPaginatedResponse<IPostResponse>>
}

export interface IPostService {
  createPost(postData: Omit<IPost, 'author'>, authorId: string): Promise<IPostResponse>
  getPostById(id: string): Promise<IPostResponse | null>
  getAllPosts(pagination: IPaginationQuery): Promise<IPaginatedResponse<IPostResponse>>
  updatePost(id: string, postData: Partial<IPost>, authorId: string): Promise<IPostResponse>
  deletePost(id: string, authorId: string): Promise<void>
}

export interface IAuthService {
  generateToken(userId: string): string
  verifyToken(token: string): Promise<string>
  hashPassword(password: string): Promise<string>
  comparePassword(password: string, hashedPassword: string): Promise<boolean>
} 