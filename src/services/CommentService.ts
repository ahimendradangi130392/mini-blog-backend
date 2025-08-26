import { IComment } from '../models/Comment'
import Comment from '../models/Comment'
import Post from '../models/Post'
import { ApiError, NotFoundError, AuthorizationError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import { extractMentions } from '../utils/mentions'

export interface ICommentResponse {
  _id: string
  content: string
  author: {
    _id: string
    username: string
    email: string
    createdAt: Date
  }
  post: string
  parentComment?: string
  mentions: string[]
  likes: string[]
  createdAt: Date
  updatedAt: Date
}

export class CommentService {
  public async createComment(
    content: string,
    postId: string,
    authorId: string,
    parentCommentId?: string
  ): Promise<ICommentResponse> {
    try {
      // Verify post exists
      const post = await Post.findById(postId)
      if (!post) {
        throw new NotFoundError('Post not found')
      }

      // Verify parent comment exists if provided
      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId)
        if (!parentComment) {
          throw new NotFoundError('Parent comment not found')
        }
      }

      // Extract mentions from content
      const mentionInfo = await extractMentions(content)

      const comment = new Comment({
        content,
        author: authorId,
        post: postId,
        parentComment: parentCommentId || null,
        mentions: mentionInfo.userIds,
        likes: []
      })

      await comment.save()
      await comment.populate('author', 'username email createdAt')

      // Add comment to post's comments array
      post.comments.push(comment._id)
      await post.save()

      return {
        _id: comment._id,
        content: comment.content,
        author: {
          _id: (comment.author as any)._id,
          username: (comment.author as any).username,
          email: (comment.author as any).email,
          createdAt: (comment.author as any).createdAt
        },
        post: comment.post.toString(),
        parentComment: comment.parentComment?.toString(),
        mentions: mentionInfo.usernames,
        likes: comment.likes.map(id => id.toString()),
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error creating comment:', error)
      throw new ApiError('Failed to create comment', 500)
    }
  }

  public async getCommentsByPost(
    postId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    comments: ICommentResponse[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    try {
      const skip = (page - 1) * limit

      const [comments, total] = await Promise.all([
        Comment.find({ post: postId, parentComment: null }) // Only top-level comments
          .populate('author', 'username email createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Comment.countDocuments({ post: postId, parentComment: null })
      ])

      const totalPages = Math.ceil(total / limit)

      const commentsResponse: ICommentResponse[] = comments.map(comment => ({
        _id: comment._id.toString(),
        content: comment.content,
        author: {
          _id: (comment.author as any)._id.toString(),
          username: (comment.author as any).username,
          email: (comment.author as any).email,
          createdAt: (comment.author as any).createdAt
        },
        post: comment.post.toString(),
        parentComment: comment.parentComment?.toString(),
        mentions: comment.mentions?.map(id => id.toString()) || [],
        likes: comment.likes?.map(id => id.toString()) || [],
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }))

      return {
        comments: commentsResponse,
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
      logger.error('Error fetching comments:', error)
      throw new ApiError('Failed to fetch comments', 500)
    }
  }

  public async toggleLike(commentId: string, userId: string): Promise<ICommentResponse> {
    try {
      const comment = await Comment.findById(commentId).populate('author', 'username email createdAt')
      
      if (!comment) {
        throw new NotFoundError('Comment not found')
      }

      const likeIndex = comment.likes.indexOf(userId as any)
      
      if (likeIndex > -1) {
        // Unlike
        comment.likes.splice(likeIndex, 1)
      } else {
        // Like
        comment.likes.push(userId as any)
      }

      await comment.save()

      return {
        _id: comment._id,
        content: comment.content,
        author: {
          _id: (comment.author as any)._id,
          username: (comment.author as any).username,
          email: (comment.author as any).email,
          createdAt: (comment.author as any).createdAt
        },
        post: comment.post.toString(),
        parentComment: comment.parentComment?.toString(),
        mentions: comment.mentions.map(id => id.toString()),
        likes: comment.likes.map(id => id.toString()),
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error toggling comment like:', error)
      throw new ApiError('Failed to toggle comment like', 500)
    }
  }

  public async deleteComment(commentId: string, authorId: string): Promise<void> {
    try {
      const comment = await Comment.findById(commentId)
      
      if (!comment) {
        throw new NotFoundError('Comment not found')
      }

      if (comment.author.toString() !== authorId) {
        throw new AuthorizationError('Not authorized to delete this comment')
      }

      // Remove comment from post's comments array
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId }
      })

      // Delete the comment
      await comment.deleteOne()
      
      logger.info(`Comment deleted successfully: ${comment.content}`)
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error deleting comment:', error)
      throw new ApiError('Failed to delete comment', 500)
    }
  }
} 