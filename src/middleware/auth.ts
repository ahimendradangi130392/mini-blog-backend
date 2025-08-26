import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import dotenv from 'dotenv'
dotenv.config()

interface AuthRequest extends Request {
  user?: any
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
      const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' })
    }

    req.user = user
    next()
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: 'Invalid token.' })
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      const user = await User.findById(decoded.userId).select('-password')
      req.user = user
    }
    
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
} 