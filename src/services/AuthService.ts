import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IAuthService, IUser, IUserResponse } from '../types'
import User from '../models/User'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import dotenv from 'dotenv'
dotenv.config()

export class AuthService implements IAuthService {
  private readonly JWT_SECRET: string
  private readonly JWT_EXPIRES_IN: string
  private readonly SALT_ROUNDS: number

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set')
    }
    this.JWT_SECRET = process.env.JWT_SECRET
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
    this.SALT_ROUNDS = 12
  }

  public generateToken(userId: string): string {
    try {
      return jwt.sign(
        { userId },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN as any }
      )
    } catch (error) {
      logger.error('Error generating JWT token:', error)
      throw new ApiError('Failed to generate authentication token', 500)
    }
  }

  public async verifyToken(token: string): Promise<string> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string }
      return decoded.userId
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError('Invalid token', 401)
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError('Token expired', 401)
      }
      logger.error('Error verifying JWT token:', error)
      throw new ApiError('Token verification failed', 500)
    }
  }

  public async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS)
    } catch (error) {
      logger.error('Error hashing password:', error)
      throw new ApiError('Password hashing failed', 500)
    }
  }

  public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
      logger.error('Error comparing passwords:', error)
      throw new ApiError('Password comparison failed', 500)
    }
  }

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

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password)

      // Create user
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword
      })

      await user.save()

      // Return user without password
      const userResponse: IUserResponse = {
        _id: user._id,
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

  public async authenticateUser(email: string, password: string): Promise<IUser> {
    try {
      const user = await User.findOne({ email })
      if (!user) {
        throw new ApiError('Invalid credentials', 401)
      }

      const isPasswordValid = await this.comparePassword(password, user.password)
      if (!isPasswordValid) {
        throw new ApiError('Invalid credentials', 401)
      }

      logger.info(`User authenticated successfully: ${user.username}`)
      return user
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error authenticating user:', error)
      throw new ApiError('Authentication failed', 500)
    }
  }

  public async getUserById(userId: string): Promise<IUserResponse | null> {
    try {
      const user = await User.findById(userId).select('-password')
      return user ? {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      } : null
    } catch (error) {
      logger.error('Error fetching user by ID:', error)
      throw new ApiError('Failed to fetch user', 500)
    }
  }
} 