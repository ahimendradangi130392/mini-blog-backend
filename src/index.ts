import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'


import { databaseConnection } from './config/database'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import postRoutes from './routes/posts'
import commentRoutes from './routes/comments'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000



// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Database connection
databaseConnection.connect()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Mini Blog API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)

// 404 handler
app.use('*', notFoundHandler)

// Error handling middleware (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
}) 