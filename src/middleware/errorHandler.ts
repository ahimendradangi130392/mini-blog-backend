import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500
  let message = 'Internal Server Error'
  let errors: any = undefined

  // Handle known API errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode
    message = error.message
  }
  // Handle Mongoose validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
    errors = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }))
  }
  // Handle Mongoose cast errors (invalid ObjectId)
  else if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  }
  // Handle duplicate key errors
  else if ((error as any).code === 11000) {
    statusCode = 409
    message = 'Duplicate field value'
    const field = Object.keys((error as any).keyValue)[0]
    errors = [{ field, message: `${field} already exists` }]
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip
    })
  } else {
    logger.warn('Client Error:', {
      error: error.message,
      url: req.url,
      method: req.method,
      ip: req.ip
    })
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
} 