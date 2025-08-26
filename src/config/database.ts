import mongoose from 'mongoose'

export class DatabaseConnection {
  private static instance: DatabaseConnection
  private isConnected = false

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected')
      return
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-blog'
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false
      })

      this.isConnected = true
      console.log('Successfully connected to MongoDB')

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error)
        this.isConnected = false
      })

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected')
        this.isConnected = false
      })

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected')
        this.isConnected = true
      })

      // Graceful shutdown
      process.on('SIGINT', this.gracefulShutdown.bind(this))
      process.on('SIGTERM', this.gracefulShutdown.bind(this))

    } catch (error) {
      console.error('Failed to connect to MongoDB:', error)
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    try {
      await mongoose.disconnect()
      this.isConnected = false
      console.log('Disconnected from MongoDB')
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error)
      throw error
    }
  }

  private async gracefulShutdown(): Promise<void> {
    console.log('Received shutdown signal, closing database connection...')
    await this.disconnect()
    process.exit(0)
  }

  public getConnectionStatus(): boolean {
    return this.isConnected
  }
}

export const databaseConnection = DatabaseConnection.getInstance() 