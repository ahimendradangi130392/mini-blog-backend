import express from 'express'
import { CommentController } from '../controllers'
import { auth } from '../middleware'

const router = express.Router()
const commentController = new CommentController()

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', auth, commentController.createComment)

// @route   GET /api/comments/post/:postId
// @desc    Get comments for a specific post
// @access  Public
router.get('/post/:postId', commentController.getCommentsByPost)

// @route   POST /api/comments/:id/like
// @desc    Toggle like on a comment
// @access  Private
router.post('/:id/like', auth, commentController.toggleLike)

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, commentController.deleteComment)

export default router 