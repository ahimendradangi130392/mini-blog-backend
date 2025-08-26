import express from 'express'
import { PostController } from '../controllers'
import { auth } from '../middleware'

const router = express.Router()
const postController = new PostController()

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', postController.getAllPosts)

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', postController.getPostById)

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, postController.createPost)

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, postController.updatePost)

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, postController.deletePost)

// @route   POST /api/posts/:id/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:id/like', auth, postController.toggleLike)

// @route   POST /api/posts/:id/repost
// @desc    Re-post a post
// @access  Private
router.post('/:id/repost', auth, postController.rePost)

// @route   GET /api/posts/mention/:username
// @desc    Get posts that mention a specific user
// @access  Public
router.get('/mention/:username', postController.getPostsByMention)

export default router 