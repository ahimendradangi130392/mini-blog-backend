import { Request, Response, NextFunction } from 'express'
import { CommentService } from '../services/CommentService'
import { IAuthRequest } from '../types'
import { logger } from '../utils/logger'

export class CommentController {
  private commentService: CommentService

  constructor() {
    this.commentService = new CommentService()
  }

  // Create a new comment
  public createComment = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { postId, content, parentCommentId } = req.body

      if (!content || !postId) {
        res.status(400).json({
          success: false,
          message: 'Content and postId are required'
        })
        return
      }

      const comment = await this.commentService.createComment(
        content,
        postId,
        req.user._id,
        parentCommentId
      )

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: { comment }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get comments for a post
  public getCommentsByPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { postId } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.commentService.getCommentsByPost(postId, page, limit)

      res.json({
        success: true,
        message: 'Comments retrieved successfully',
        data: result.comments,
        pagination: result.pagination
      })
    } catch (error) {
      next(error)
    }
  }

  // Toggle like on a comment
  public toggleLike = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { id } = req.params

      const comment = await this.commentService.toggleLike(id, req.user._id)

      res.json({
        success: true,
        message: 'Comment like toggled successfully',
        data: { comment }
      })
    } catch (error) {
      next(error)
    }
  }

  // Delete a comment
  public deleteComment = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { id } = req.params

      await this.commentService.deleteComment(id, req.user._id)

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }
} 