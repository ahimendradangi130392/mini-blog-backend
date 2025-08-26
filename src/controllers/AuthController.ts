import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services'
import { IAuthRequest, ILoginCredentials, ISignupCredentials, IAuthResponse } from '../types'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  public signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, password }: ISignupCredentials = req.body

      const user = await this.authService.createUser({ username, email, password })
      const token = this.authService.generateToken(user._id)

      const response: IAuthResponse = {
        message: 'User created successfully',
        token,
        user,
        success: true
      }

      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password }: ILoginCredentials = req.body

      const user = await this.authService.authenticateUser(email, password)
      const token = this.authService.generateToken(user._id)

      const userResponse = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }

      const response: IAuthResponse = {
        message: 'Login successful',
        token,
        user: userResponse,
        success: true
      }

      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  public getCurrentUser = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError('User not found', 404)
      }

      res.json({
        user: req.user
      })
    } catch (error) {
      next(error)
    }
  }
} 