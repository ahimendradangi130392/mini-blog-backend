import { IUserService, IUserResponse, IPaginationQuery, IPaginatedResponse } from '../types'
import User from '../models/User'
import Post from '../models/Post'
import { ApiError, NotFoundError } from '../utils/ApiError'
import { logger } from '../utils/logger'

export class UserService implements IUserService {
  public async createUser(userData: { username: string; email: string; password: string }): Promise<IUserResponse> {
    try {
      // Check for existing user
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }]
      })

      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new ApiError('Email already registered', 400)
        }
        if (existingUser.username === userData.username) {
          throw new ApiError('Username already taken', 400)
        }
      }

      // Create user (password hashing is handled in the model)
      const user = new User(userData)
      await user.save()

      const userResponse: IUserResponse = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }

      logger.info(`User created successfully: ${user.username}`)
      return userResponse
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error creating user:', error)
      throw new ApiError('Failed to create user', 500)
    }
  }

  public async findUserByEmail(email: string): Promise<any> {
    try {
      return await User.findOne({ email })
    } catch (error) {
      logger.error('Error finding user by email:', error)
      throw new ApiError('Failed to find user', 500)
    }
  }

  public async findUserById(id: string): Promise<IUserResponse | null> {
    try {
      const user = await User.findById(id).select('-password')
      
      if (!user) {
        return null
      }

      return {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    } catch (error) {
      logger.error('Error finding user by ID:', error)
      throw new ApiError('Failed to find user', 500)
    }
  }

  public async getAllUsers(pagination: IPaginationQuery): Promise<IPaginatedResponse<IUserResponse>> {
    try {
      const page = Math.max(1, pagination.page || 1)
      const limit = Math.min(50, Math.max(1, pagination.limit || 10))
      const skip = (page - 1) * limit

      const sortOptions: any = {}
      if (pagination.sortBy) {
        sortOptions[pagination.sortBy] = pagination.sortOrder === 'asc' ? 1 : -1
      } else {
        sortOptions.createdAt = -1
      }

      const [users, total] = await Promise.all([
        User.find()
          .select('-password')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments()
      ])

      const totalPages = Math.ceil(total / limit)

      const usersResponse: IUserResponse[] = users.map(user => ({
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }))

      return {
        data: usersResponse,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      logger.error('Error fetching users:', error)
      throw new ApiError('Failed to fetch users', 500)
    }
  }

  public async getUserPosts(userId: string, pagination: IPaginationQuery): Promise<IPaginatedResponse<any>> {
    try {
      // First verify user exists
      const user = await User.findById(userId)
      if (!user) {
        throw new NotFoundError('User not found')
      }

      const page = Math.max(1, pagination.page || 1)
      const limit = Math.min(50, Math.max(1, pagination.limit || 10))
      const skip = (page - 1) * limit

      const sortOptions: any = {}
      if (pagination.sortBy) {
        sortOptions[pagination.sortBy] = pagination.sortOrder === 'asc' ? 1 : -1
      } else {
        sortOptions.createdAt = -1
      }

      const [posts, total] = await Promise.all([
        Post.find({ author: userId })
          .populate('author', 'username email createdAt')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Post.countDocuments({ author: userId })
      ])

      const totalPages = Math.ceil(total / limit)

      const postsResponse = posts.map(post => ({
        _id: post._id.toString(),
        title: post.title,
        content: post.content,
        author: {
          _id: (post.author as any)._id.toString(),
          username: (post.author as any).username,
          email: (post.author as any).email,
          createdAt: (post.author as any).createdAt
        },
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))

      return {
        data: postsResponse,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error fetching user posts:', error)
      throw new ApiError('Failed to fetch user posts', 500)
    }
  }

  public async findUserByUsername(username: string): Promise<IUserResponse | null> {
    try {
      const user = await User.findOne({ username }).select('-password')
      if (!user) return null
      return {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    } catch (error) {
      logger.error('Error finding user by username:', error)
      throw new ApiError('Failed to find user', 500)
    }
  }

  public async getUserPostsByUsername(username: string, pagination: IPaginationQuery): Promise<IPaginatedResponse<any>> {
    try {
      const user = await User.findOne({ username })
      if (!user) {
        return { 
          data: [], 
          pagination: { 
            page: pagination.page || 1, 
            limit: pagination.limit || 10, 
            total: 0, 
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          } 
        }
      }
      return this.getUserPosts(user._id.toString(), pagination)
    } catch (error) {
      logger.error('Error fetching user posts by username:', error)
      throw new ApiError('Failed to fetch user posts', 500)
    }
  }

  public async searchUsersByUsername(query: string, limit: number = 10): Promise<IUserResponse[]> {
    try {
      const users = await User.find({
        username: { $regex: query, $options: 'i' }
      })
        .select('-password')
        .limit(limit)
        .lean()

      return users.map(user => ({
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }))
    } catch (error) {
      logger.error('Error searching users by username:', error)
      throw new ApiError('Failed to search users', 500)
    }
  }
} 