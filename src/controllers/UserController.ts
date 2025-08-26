import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services'
import { IPaginationQuery } from '../types'
import { logger } from '../utils/logger'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  public getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination: IPaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      }

      const result = await this.userService.getAllUsers(pagination)

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      next(error)
    }
  }

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const user = await this.userService.findUserById(id)
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        })
        return
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: { user }
      })
    } catch (error) {
      next(error)
    }
  }

  public getUserPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const pagination: IPaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      }

      const result = await this.userService.getUserPosts(id, pagination)

      res.json({
        success: true,
        message: 'User posts retrieved successfully',
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      next(error)
    }
  }

  public getUserByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params
      const user = await this.userService.findUserByUsername(username)
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' })
        return
      }
      res.json({ success: true, message: 'User retrieved successfully', data: { user } })
    } catch (error) {
      next(error)
    }
  }

  public getUserPostsByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params
      const pagination: IPaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      }

      const result = await this.userService.getUserPostsByUsername(username, pagination)

      res.json({
        success: true,
        message: 'User posts retrieved successfully',
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      next(error)
    }
  }

  public searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q } = req.query
      const limit = parseInt(req.query.limit as string) || 10

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Query parameter "q" is required'
        })
        return
      }

      const users = await this.userService.searchUsersByUsername(q, limit)

      res.json({
        success: true,
        message: 'Users found successfully',
        data: users
      })
    } catch (error) {
      next(error)
    }
  }
} 