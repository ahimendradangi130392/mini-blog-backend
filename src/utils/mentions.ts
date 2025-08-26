import User from '../models/User'

export interface MentionInfo {
  usernames: string[]
  userIds: string[]
}

/**
 * Extract user mentions from text content
 * @param content - The text content to parse
 * @returns Promise<MentionInfo> - Object containing usernames and user IDs
 */
export const extractMentions = async (content: string): Promise<MentionInfo> => {
  const mentionRegex = /@(\w+)/g
  const matches = content.match(mentionRegex)
  
  if (!matches) {
    return { usernames: [], userIds: [] }
  }

  // Extract usernames (remove @ symbol)
  const usernames = matches.map(match => match.substring(1))
  
  try {
    // Find users by usernames
    const users = await User.find({ username: { $in: usernames } }).select('_id username')
    
    // Create a map for quick lookup
    const userMap = new Map(users.map(user => [user.username, user._id.toString()]))
    
    // Get user IDs for found usernames
    const userIds = usernames
      .map(username => userMap.get(username))
      .filter(id => id !== undefined) as string[]
    
    return { usernames, userIds }
  } catch (error) {
    console.error('Error extracting mentions:', error)
    return { usernames, userIds: [] }
  }
}

/**
 * Format content to highlight mentions with links
 * @param content - The text content
 * @param usernames - Array of usernames to highlight
 * @returns string - Formatted content with mention links
 */
export const formatMentions = (content: string, usernames: string[]): string => {
  let formattedContent = content
  
  usernames.forEach(username => {
    const mentionRegex = new RegExp(`@${username}`, 'g')
    formattedContent = formattedContent.replace(
      mentionRegex, 
      `<a href="/user/${username}" class="mention-link">@${username}</a>`
    )
  })
  
  return formattedContent
} 