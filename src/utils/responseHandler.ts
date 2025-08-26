import { Response } from 'express'
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants'

export class ResponseHandler {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = HTTP_STATUS.OK
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message: message || SUCCESS_MESSAGES.RESOURCE_RETRIEVED,
      data,
      timestamp: new Date().toISOString()
    })
  }

  static created<T>(
    res: Response,
    data: T,
    message?: string
  ): Response {
    return this.success(res, data, message, HTTP_STATUS.CREATED)
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors?: any[]
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    })
  }

  static badRequest(
    res: Response,
    message: string = ERROR_MESSAGES.VALIDATION_FAILED,
    errors?: any[]
  ): Response {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, errors)
  }

  static unauthorized(
    res: Response,
    message: string = ERROR_MESSAGES.AUTHENTICATION_FAILED
  ): Response {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED)
  }

  static forbidden(
    res: Response,
    message: string = ERROR_MESSAGES.AUTHORIZATION_FAILED
  ): Response {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN)
  }

  static notFound(
    res: Response,
    message: string = ERROR_MESSAGES.RESOURCE_NOT_FOUND
  ): Response {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND)
  }

  static conflict(
    res: Response,
    message: string = ERROR_MESSAGES.DUPLICATE_RESOURCE
  ): Response {
    return this.error(res, message, HTTP_STATUS.CONFLICT)
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    },
    message?: string
  ): Response {
    return this.success(res, {
      data,
      pagination
    }, message)
  }
} 