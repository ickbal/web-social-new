import { ChatMessage, ChatState, MessageReaction } from "./types"
import { getRoom, setRoom } from "./cache"
import { v4 as uuidv4 } from 'uuid'

// Initialize chat state for a room
export const initializeChatState = async (roomId: string) => {
  const room = await getRoom(roomId)
  if (room === null) {
    throw new Error("Initializing chat for non-existing room:" + roomId)
  }
  
  // Check if chat state already exists in Redis cache
  const chatState: ChatState = {
    messages: [],
    lastUpdate: new Date().getTime(),
    isTyping: {}
  }
  
  return chatState
}

// Get chat state for a room
export const getChatState = async (roomId: string): Promise<ChatState> => {
  const room = await getRoom(roomId)
  if (room === null) {
    throw new Error("Getting chat for non-existing room:" + roomId)
  }
  
  // In a real implementation, this would fetch from Redis or another data store
  // For now, we'll initialize if it doesn't exist
  if (!room.chatState) {
    room.chatState = await initializeChatState(roomId)
    await setRoom(roomId, room)
  }
  
  return room.chatState
}

// Update chat state for a room
export const updateChatState = async (roomId: string, chatState: ChatState) => {
  const room = await getRoom(roomId)
  if (room === null) {
    throw new Error("Updating chat for non-existing room:" + roomId)
  }
  
  room.chatState = chatState
  await setRoom(roomId, room)
  return chatState
}

// Add a new message to chat state
export const addChatMessage = async (roomId: string, message: any) => {
  const chatState = await getChatState(roomId)
  
  // Generate a unique ID for the message
  const newMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    reactions: []
  }
  
  chatState.messages.push(newMessage)
  chatState.lastUpdate = Date.now()
  
  await updateChatState(roomId, chatState)
  return newMessage
}

// Create a new message
export const createNewMessage = (
  userId: string,
  userName: string,
  userAvatar: string,
  content: string,
  contentType: 'text' | 'rich' | 'gif' = 'text',
  gifUrl?: string
): ChatMessage => {
  return {
    id: uuidv4(),
    userId,
    userName,
    userAvatar,
    content,
    richContent: contentType === 'rich' ? content : undefined,
    timestamp: Date.now(),
    gifUrl,
    reactions: [],
    translations: {}
  }
}

// Add reaction to a message
export const addMessageReaction = (
  message: ChatMessage,
  emoji: string,
  userId: string,
  userName: string
): ChatMessage => {
  const updatedMessage = { ...message }
  
  // Find existing reaction or create new one
  let reaction = updatedMessage.reactions.find(r => r.emoji === emoji)
  
  if (reaction) {
    // Don't add duplicate user reactions
    if (!reaction.users.includes(userId)) {
      reaction.users.push(userId)
      reaction.count = reaction.users.length
    }
  } else {
    // Create new reaction
    updatedMessage.reactions.push({
      emoji,
      count: 1,
      users: [userId]
    })
  }
  
  return updatedMessage
}

// Remove reaction from a message
export const removeMessageReaction = (
  message: ChatMessage,
  emoji: string,
  userId: string
): ChatMessage => {
  const updatedMessage = { ...message }
  
  // Find existing reaction
  const reactionIndex = updatedMessage.reactions.findIndex(r => r.emoji === emoji)
  
  if (reactionIndex !== -1) {
    const reaction = updatedMessage.reactions[reactionIndex]
    
    // Remove user from reaction
    const userIndex = reaction.users.indexOf(userId)
    if (userIndex !== -1) {
      reaction.users.splice(userIndex, 1)
      reaction.count = reaction.users.length
      
      // Remove reaction if no users left
      if (reaction.count === 0) {
        updatedMessage.reactions.splice(reactionIndex, 1)
      }
    }
  }
  
  return updatedMessage
}

// Add translation to a message
export const addMessageTranslation = async (roomId: string, messageId: string, language: string, translation: string) => {
  const chatState = await getChatState(roomId)
  
  const messageIndex = chatState.messages.findIndex(msg => msg.id === messageId)
  if (messageIndex === -1) return null
  
  const message = chatState.messages[messageIndex]
  
  // Initialize translations object if it doesn't exist
  if (!message.translations) {
    message.translations = {}
  }
  
  // Add translation
  message.translations[language] = translation
  
  chatState.lastUpdate = Date.now()
  await updateChatState(roomId, chatState)
  
  return message.translations
}
