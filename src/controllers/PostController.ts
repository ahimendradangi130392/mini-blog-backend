import { Request, Response, NextFunction } from 'express'
import { PostService } from '../services'
import { IAuthRequest, IPaginationQuery } from '../types'
import { logger } from '../utils/logger'

export class PostController {
  private postService: PostService

  constructor() {
    this.postService = new PostService()
  }

  public getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination: IPaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      }

      const result = await this.postService.getAllPosts(pagination)

      res.json({
        success: true,
        message: 'Posts retrieved successfully',
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      next(error)
    }
  }

  public getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const post = await this.postService.getPostById(id)
      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found'
        })
        return
      }

      res.json({
        success: true,
        message: 'Post retrieved successfully',
        data: { post }
      })
    } catch (error) {
      next(error)
    }
  }

  public createPost = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { title, content } = req.body

      const post = await this.postService.createPost(
        { title, content } as any,
        req.user._id
      )

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post }
      })
    } catch (error) {
      next(error)
    }
  }

  public updatePost = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { id } = req.params
      const { title, content } = req.body

      const post = await this.postService.updatePost(
        id,
        { title, content },
        req.user._id
      )

      res.json({
        success: true,
        message: 'Post updated successfully',
        data: { post }
      })
    } catch (error) {
      next(error)
    }
  }

  public deletePost = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      await this.postService.deletePost(id, req.user!._id)

      res.json({
        success: true,
        message: 'Post deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  // Toggle like on a post
  public toggleLike = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const post = await this.postService.toggleLike(id, req.user._id)

      res.json({
        success: true,
        message: 'Like toggled successfully',
        data: { post }
      })
    } catch (error) {
      next(error)
    }
  }

  // Re-post functionality
  public rePost = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const post = await this.postService.rePost(id, req.user._id)

      res.json({
        success: true,
        message: 'Post re-posted successfully',
        data: { post }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get posts that mention a specific user
  public getPostsByMention = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params
      const pagination: IPaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      }

      const result = await this.postService.getPostsByMention(username, pagination)

      res.json({
        success: true,
        message: 'Posts by mention retrieved successfully',
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      next(error)
    }
  }
} 