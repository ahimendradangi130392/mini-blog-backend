import { IPostService, IPost, IPostResponse, IPaginationQuery, IPaginatedResponse } from '../types'
import Post from '../models/Post'
import { ApiError, NotFoundError, AuthorizationError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import { extractMentions } from '../utils/mentions'

export class PostService implements IPostService {
  public async createPost(postData: Omit<IPost, 'author'>, authorId: string): Promise<IPostResponse> {
    try {
      // Extract mentions from content
      const mentionInfo = await extractMentions(postData.content)
      
      const post = new Post({
        title: postData.title,
        content: postData.content,
        author: authorId,
        mentions: mentionInfo.userIds,
        likes: [],
        comments: [],
        rePosts: []
      })

      await post.save()
      await post.populate('author', 'username email createdAt')

      const postResponse: IPostResponse = {
        _id: post._id,
        title: post.title,
        content: post.content,
        author: {
          _id: (post.author as any)._id,
          username: (post.author as any).username,
          email: (post.author as any).email,
          createdAt: (post.author as any).createdAt
        },
        likes: post.likes.map(id => id.toString()),
        comments: post.comments.map(id => id.toString()),
        rePosts: post.rePosts.map(id => id.toString()),
        mentions: mentionInfo.usernames,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }

      logger.info(`Post created successfully: ${post.title}`)
      return postResponse
    } catch (error) {
      logger.error('Error creating post:', error)
      throw new ApiError('Failed to create post', 500)
    }
  }

  public async getPostById(id: string): Promise<IPostResponse | null> {
    try {
      const post = await Post.findById(id).populate('author', 'username email createdAt')
      
      if (!post) {
        return null
      }

      return {
        _id: post._id,
        title: post.title,
        content: post.content,
        author: {
          _id: (post.author as any)._id,
          username: (post.author as any).username,
          email: (post.author as any).email,
          createdAt: (post.author as any).createdAt
        },
        likes: post.likes?.map(id => id.toString()) || [],
        comments: post.comments?.map(id => id.toString()) || [],
        rePosts: post.rePosts?.map(id => id.toString()) || [],
        mentions: post.mentions?.map(id => id.toString()) || [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    } catch (error) {
      logger.error('Error fetching post by ID:', error)
      throw new ApiError('Failed to fetch post', 500)
    }
  }

  public async getAllPosts(pagination: IPaginationQuery): Promise<IPaginatedResponse<IPostResponse>> {
    try {
      const page = Math.max(1, pagination.page || 1)
      const limit = Math.min(50, Math.max(1, pagination.limit || 10))
      const skip = (page - 1) * limit

      const sortOptions: any = {}
      if (pagination.sortBy) {
        sortOptions[pagination.sortBy] = pagination.sortOrder === 'asc' ? 1 : -1
      } else {
        sortOptions.createdAt = -1
      }

      const [posts, total] = await Promise.all([
        Post.find()
          .populate('author', 'username email createdAt')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Post.countDocuments()
      ])

      const totalPages = Math.ceil(total / limit)

      const postsResponse: IPostResponse[] = posts.map(post => ({
        _id: post._id.toString(),
        title: post.title,
        content: post.content,
        author: {
          _id: (post.author as any)._id.toString(),
          username: (post.author as any).username,
          email: (post.author as any).email,
          createdAt: (post.author as any).createdAt
        },
        likes: post.likes?.map(id => id.toString()) || [],
        comments: post.comments?.map(id => id.toString()) || [],
        rePosts: post.rePosts?.map(id => id.toString()) || [],
        mentions: post.mentions?.map(id => id.toString()) || [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))

      return {
        data: postsResponse,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      logger.error('Error fetching posts:', error)
      throw new ApiError('Failed to fetch posts', 500)
    }
  }

  public async updatePost(id: string, postData: Partial<IPost>, authorId: string): Promise<IPostResponse> {
    try {
      const post = await Post.findById(id)
      console.log("post", post);
      
      if (!post) {
        throw new NotFoundError('Post not found')
      }

      if (post.author.toString() !== authorId.toString()) {
        throw new AuthorizationError('Not authorized to update this post')
      }

      // Update only provided fields
      if (postData.title !== undefined) post.title = postData.title
      if (postData.content !== undefined) post.content = postData.content

      await post.save()
      await post.populate('author', 'username email createdAt')

      const postResponse: IPostResponse = {
        _id: post._id,
        title: post.title,
        content: post.content,
        author: {
          _id: (post.author as any)._id,
          username: (post.author as any).username,
          email: (post.author as any).email,
          createdAt: (post.author as any).createdAt
        },
        likes: post.likes?.map(id => id.toString()) || [],
        comments: post.comments?.map(id => id.toString()) || [],
        rePosts: post.rePosts?.map(id => id.toString()) || [],
        mentions: post.mentions?.map(id => id.toString()) || [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }

      logger.info(`Post updated successfully: ${post.title}`)
      return postResponse
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error updating post:', error)
      throw new ApiError('Failed to update post', 500)
    }
  }

  public async deletePost(id: string, authorId: string): Promise<void> {
    try {
      const post = await Post.findById(id)
      
      if (!post) {
        throw new NotFoundError('Post not found')
      }

      if (post.author.toString() !== authorId.toString()) {
        throw new AuthorizationError('Not authorized to delete this post')
      }

      await post.deleteOne()
      logger.info(`Post deleted successfully: ${post.title}`)
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error deleting post:', error)
      throw new ApiError('Failed to delete post', 500)
    }
  }

  public async getUserPosts(userId: string, pagination: IPaginationQuery): Promise<IPaginatedResponse<IPostResponse>> {
    try {
      const page = Math.max(1, pagination.page || 1)
      const limit = Math.min(50, Math.max(1, pagination.limit || 10))
      const skip = (page - 1) * limit

      const sortOptions: any = {}
      if (pagination.sortBy) {
        sortOptions[pagination.sortBy] = pagination.sortOrder === 'asc' ? 1 : -1
      } else {
        sortOptions.createdAt = -1
      }

      const [posts, total] = await Promise.all([
        Post.find({ author: userId })
          .populate('author', 'username email createdAt')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Post.countDocuments({ author: userId })
      ])

      const totalPages = Math.ceil(total / limit)

      const postsResponse: IPostResponse[] = posts.map(post => ({
        _id: post._id.toString(),
        title: post.title,
        content: post.content,
        author: {
          _id: (post.author as any)._id.toString(),
          username: (post.author as any).username,
          email: (post.author as any).email,
          createdAt: (post.author as any).createdAt
        },
        likes: post.likes?.map(id => id.toString()) || [],
        comments: post.comments?.map(id => id.toString()) || [],
        rePosts: post.rePosts?.map(id => id.toString()) || [],
        mentions: post.mentions?.map(id => id.toString()) || [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))

      return {
        data: postsResponse,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      logger.error('Error fetching user posts:', error)
      throw new ApiError('Failed to fetch user posts', 500)
    }
  }

  // Like/Unlike a post
  public async toggleLike(postId: string, userId: string): Promise<IPostResponse> {
    try {
      const post = await Post.findById(postId).populate('author', 'username email createdAt')
      
      if (!post) {
        throw new NotFoundError('Post not found')
      }

      const likeIndex = post.likes.indexOf(userId as any)
      
      if (likeIndex > -1) {
        // Unlike
        post.likes.splice(likeIndex, 1)
      } else {
        // Like
        post.likes.push(userId as any)
      }

      await post.save()

      return {
        _id: post._id,
        title: post.title,
        content: post.content,
        author: {
          _id: (post.author as any)._id,
          username: (post.author as any).username,
          email: (post.author as any).email,
          createdAt: (post.author as any).createdAt
        },
        likes: post.likes.map(id => id.toString()),
        comments: post.comments.map(id => id.toString()),
        rePosts: post.rePosts.map(id => id.toString()),
        mentions: [], // Will be populated if needed
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error toggling like:', error)
      throw new ApiError('Failed to toggle like', 500)
    }
  }

  // Re-post functionality
  public async rePost(postId: string, userId: string): Promise<IPostResponse> {
    try {
      const originalPost = await Post.findById(postId).populate('author', 'username email createdAt')
      
      if (!originalPost) {
        throw new NotFoundError('Original post not found')
      }

      // Create a new post that references the original
      const rePost = new Post({
        title: `Re-post: ${originalPost.title}`,
        content: originalPost.content,
        author: userId,
        originalPost: postId,
        mentions: [],
        likes: [],
        comments: [],
        rePosts: []
      })

      await rePost.save()

      // Add user to rePosts array of original post
      originalPost.rePosts.push(userId as any)
      await originalPost.save()

      await rePost.populate('author', 'username email createdAt')

      return {
        _id: rePost._id,
        title: rePost.title,
        content: rePost.content,
        author: {
          _id: (rePost.author as any)._id,
          username: (rePost.author as any).username,
          email: (rePost.author as any).email,
          createdAt: (rePost.author as any).createdAt
        },
        likes: rePost.likes.map(id => id.toString()),
        comments: rePost.comments.map(id => id.toString()),
        rePosts: rePost.rePosts.map(id => id.toString()),
        mentions: [],
        createdAt: rePost.createdAt,
        updatedAt: rePost.updatedAt
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error('Error creating re-post:', error)
      throw new ApiError('Failed to create re-post', 500)
    }
  }

  // Get posts that mention a specific user
  public async getPostsByMention(username: string, pagination: IPaginationQuery): Promise<IPaginatedResponse<IPostResponse>> {
    try {
      const page = Math.max(1, pagination.page || 1)
      const limit = Math.min(50, Math.max(1, pagination.limit || 10))
      const skip = (page - 1) * limit

      // Find posts that mention this username
      const posts = await Post.find({
        content: { $regex: new RegExp(`@${username}`, 'i') }
      })
        .populate('author', 'username email createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      const total = await Post.countDocuments({
        content: { $regex: new RegExp(`@${username}`, 'i') }
      })

      const totalPages = Math.ceil(total / limit)

      const postsResponse: IPostResponse[] = posts.map(post => ({
        _id: post._id.toString(),
        title: post.title,
        content: post.content,
        author: {
          _id: (post.author as any)._id.toString(),
          username: (post.author as any).username,
          email: (post.author as any).email,
          createdAt: (post.author as any).createdAt
        },
        likes: post.likes?.map(id => id.toString()) || [],
        comments: post.comments?.map(id => id.toString()) || [],
        rePosts: post.rePosts?.map(id => id.toString()) || [],
        mentions: post.mentions?.map(id => id.toString()) || [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))

      return {
        data: postsResponse,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      logger.error('Error fetching posts by mention:', error)
      throw new ApiError('Failed to fetch posts by mention', 500)
    }
  }
} 