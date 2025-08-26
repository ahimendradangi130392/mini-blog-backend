// Test setup file for Jest
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test'
  
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  
  console.log('MongoDB Memory Server URI:', mongoUri)
  
  // Connect to test database with proper options
  await mongoose.connect(mongoUri, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    bufferCommands: false,
    connectTimeoutMS: 10000
  })
  
  // Wait for connection to be ready
  await mongoose.connection.asPromise()
  
  // Add a small delay to ensure server is fully ready
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  console.log('MongoDB connected successfully')
})

// Global test cleanup
afterAll(async () => {
  try {
    // Disconnect from test database
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
      console.log('MongoDB disconnected successfully')
    }
    
    // Stop in-memory MongoDB
    if (mongoServer) {
      await mongoServer.stop()
      console.log('MongoDB Memory Server stopped')
    }
  } catch (error) {
    console.error('Error during test cleanup:', error)
  }
})

// Clean up collections between tests
beforeEach(async () => {
  try {
    const collections = mongoose.connection.collections
    
    for (const key in collections) {
      const collection = collections[key]
      await collection.deleteMany({})
    }
  } catch (error) {
    console.error('Error during collection cleanup:', error)
  }
})

// Increase timeout for database operations
jest.setTimeout(30000) 