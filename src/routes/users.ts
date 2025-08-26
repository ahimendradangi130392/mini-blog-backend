import express from 'express'
import { UserController } from '../controllers'

const router = express.Router()

const userController = new UserController()

// @route   GET /api/users
// @desc    Get all users
// @access  Public
router.get('/', userController.getAllUsers)

// @route   GET /api/users/search
// @desc    Search users by username for auto-complete
// @access  Public
router.get('/search', userController.searchUsers)

// Username-based routes
router.get('/username/:username', userController.getUserByUsername)
router.get('/username/:username/posts', userController.getUserPostsByUsername)

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', userController.getUserById)

// @route   GET /api/users/:id/posts
// @desc    Get posts by user ID
// @access  Public
router.get('/:id/posts', userController.getUserPosts)

export default router 