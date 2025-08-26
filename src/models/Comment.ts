import mongoose, { Document, Schema } from 'mongoose'

export interface IComment extends Document {
  content: string
  author: mongoose.Types.ObjectId
  post: mongoose.Types.ObjectId
  parentComment?: mongoose.Types.ObjectId // For nested replies
  mentions: mongoose.Types.ObjectId[] // User mentions
  likes: mongoose.Types.ObjectId[] // Users who liked the comment
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
})

// Create indexes for better query performance
commentSchema.index({ post: 1, createdAt: -1 })
commentSchema.index({ author: 1, createdAt: -1 })
commentSchema.index({ parentComment: 1, createdAt: -1 })

export default mongoose.model<IComment>('Comment', commentSchema) 