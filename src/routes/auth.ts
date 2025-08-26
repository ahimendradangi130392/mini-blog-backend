import express from 'express'
import { AuthController } from '../controllers'
import { validateSignup, validateLogin, auth } from '../middleware'

const router = express.Router()
const authController = new AuthController()

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, authController.signup)

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, authController.login)

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getCurrentUser)

export default router 