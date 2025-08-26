import mongoose, { Document, Schema } from 'mongoose'

export interface IPost extends Document {
  title: string
  content: string
  author: mongoose.Types.ObjectId
  likes: mongoose.Types.ObjectId[]
  comments: mongoose.Types.ObjectId[]
  rePosts: mongoose.Types.ObjectId[] // Users who re-posted
  originalPost?: mongoose.Types.ObjectId // For re-posts
  mentions: mongoose.Types.ObjectId[] // User mentions in content
  createdAt: Date
  updatedAt: Date
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  rePosts: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  originalPost: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
})

// Create index for better query performance
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ createdAt: -1 })
postSchema.index({ mentions: 1 }) // Index for mentions
postSchema.index({ originalPost: 1 }) // Index for re-posts

export default mongoose.model<IPost>('Post', postSchema) 