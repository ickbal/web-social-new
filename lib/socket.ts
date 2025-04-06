import { Socket, io } from "socket.io-client"
import { ChatMessage, ChatState, Reaction, ReactionType } from "./types"
import { translateText } from "./translation"

// Client to server events
export interface ClientToServerEvents {
  fetch: () => void
  updatePlayer: (player: any) => void
  updatePlaying: (playing: any) => void
  setPaused: (paused: boolean) => void
  setLoop: (loop: boolean) => void
  setProgress: (progress: number) => void
  setPlaybackRate: (playbackRate: number) => void
  seek: (progress: number) => void
  playEnded: () => void
  playAgain: () => void
  playItemFromPlaylist: (index: number) => void
  updatePlaylist: (playlist: any) => void
  updateUser: (user: any) => void
  playUrl: (url: string) => void
  
  // Room events
  joinRoom: (data: { roomId: string, userName: string }) => void
  
  // Chat-related events
  sendMessage: (content: string, contentType: 'text' | 'rich' | 'gif', gifUrl?: string) => void
  fetchChatHistory: () => void
  addMessageReaction: (messageId: string, emoji: string) => void
  removeMessageReaction: (messageId: string, emoji: string) => void
  translateMessage: (messageId: string, targetLanguage: string) => void
  sendReaction: (type: ReactionType) => void
  setTyping: (isTyping: boolean) => void
  videoSync: (time: number) => void
  requestSync: () => void
}

// Server to client events
export interface ServerToClientEvents {
  update: (room: any) => void
  playUrl: (url: string) => void
  
  // Chat-related events
  chatUpdate: (chatState: ChatState) => void
  messageReceived: (message: ChatMessage) => void
  messageReactionUpdate: (messageId: string, message: ChatMessage) => void
  messageTranslated: (messageId: string, translations: ChatMessage["translations"]) => void
  reactionReceived: (reaction: Reaction) => void
  userTyping: (userId: string, userName: string) => void
  roomUpdate: (roomData: any) => void
  videoSync: (time: number) => void
}

// Create socket client
export const createClientSocket = (roomId: string) => {
  return io("/", {
    path: "/api/socketio",
    query: {
      roomId,
    },
    reconnectionDelayMax: 10000,
    reconnectionAttempts: 10,
  })
}

// Helper function to send a chat message
export const sendChatMessage = (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  content: string,
  contentType: 'text' | 'rich' | 'gif' = 'text',
  gifUrl?: string
) => {
  console.log("Sending message with socket:", socket.id);
  
  if (!content && !gifUrl) {
    console.warn("Cannot send empty message");
    return;
  }
  
  console.log("Emitting sendMessage event with:", { content, contentType, gifUrl });
  socket.emit("sendMessage", content, contentType, gifUrl);
}

// Helper function to add a reaction to a message
export const addMessageReaction = (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  messageId: string,
  emoji: string
) => {
  console.log(`Adding reaction ${emoji} to message ${messageId}`);
  socket.emit("addMessageReaction", messageId, emoji);
}

// Helper function to remove a reaction from a message
export const removeMessageReaction = (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  messageId: string,
  emoji: string
) => {
  console.log(`Removing reaction ${emoji} from message ${messageId}`);
  socket.emit("removeMessageReaction", messageId, emoji);
}

// Helper function to translate a message
export const translateMessage = async (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  messageId: string,
  targetLanguage: string
) => {
  console.log(`Translating message ${messageId} to ${targetLanguage}`);
  socket.emit("translateMessage", messageId, targetLanguage);
}
