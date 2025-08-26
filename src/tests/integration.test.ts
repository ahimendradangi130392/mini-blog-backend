import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// Import your app and models
import User from '../models/User'
import Post from '../models/Post'

let app: express.Application
let mongoServer: MongoMemoryServer

// Create a simple test app
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  
  console.log('Test MongoDB URI:', mongoUri)
  
  // Connect to test database
  await mongoose.connect(mongoUri)
  
  // Wait for connection
  await mongoose.connection.asPromise()
  
  app = express()
  app.use(express.json())
  
  // Simple test routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' })
  })
  
  app.post('/api/test/user', async (req, res) => {
    try {
      const user = new User(req.body)
      await user.save()
      res.status(201).json({ user: { _id: user._id, username: user.username, email: user.email } })
    } catch (error: any) {
      console.error('User creation error:', error)
      res.status(400).json({ message: error.message, details: error.errors })
    }
  })
  
  app.post('/api/test/post', async (req, res) => {
    try {
      const post = new Post(req.body)
      await post.save()
      res.status(201).json({ post })
    } catch (error: any) {
      console.error('Post creation error:', error)
      res.status(400).json({ message: error.message, details: error.errors })
    }
  })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  // Clean up collections before each test
  await User.deleteMany({})
  await Post.deleteMany({})
})

describe('Mini Blog API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)
      
      expect(response.body.status).toBe('OK')
    })
  })

  describe('User Management', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }
      
      const response = await request(app)
        .post('/api/test/user')
        .send(userData)
        .expect(201)
      
      expect(response.body.user.username).toBe(userData.username)
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user._id).toBeDefined()
      
      // Verify user was saved to database
      const savedUser = await User.findById(response.body.user._id)
      expect(savedUser).toBeTruthy()
      expect(savedUser?.username).toBe(userData.username)
    })

    it('should reject user with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      }
      
      await request(app)
        .post('/api/test/user')
        .send(userData)
        .expect(400)
    })
  })

  describe('Post Management', () => {
    it('should create a new post successfully', async () => {
      // First create a user
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
      await user.save()
      
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content',
        author: user._id,
        likes: [],
        comments: [],
        rePosts: [],
        mentions: []
      }
      
      const response = await request(app)
        .post('/api/test/post')
        .send(postData)
        .expect(201)
      
      expect(response.body.post.title).toBe(postData.title)
      expect(response.body.post.content).toBe(postData.content)
      expect(response.body.post.author.toString()).toBe(user._id.toString())
      
      // Verify post was saved to database
      const savedPost = await Post.findById(response.body.post._id)
      expect(savedPost).toBeTruthy()
      expect(savedPost?.title).toBe(postData.title)
    })

    it('should reject post without title', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
      await user.save()
      
      const postData = {
        content: 'This is a test post content',
        author: user._id
      }
      
      await request(app)
        .post('/api/test/post')
        .send(postData)
        .expect(400)
    })
  })
}) 