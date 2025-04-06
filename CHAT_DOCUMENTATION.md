# Advanced Chat Feature Documentation

## Overview

This document provides comprehensive documentation for the advanced chat feature implemented in the Ickbal Watch Party application. The chat feature allows users to communicate in real-time while watching videos together, with advanced capabilities including rich text formatting, GIF support, message reactions, and translation capabilities.

## Features

### 1. Rich Text Formatting

Users can format their messages using a rich text editor powered by TinyMCE. The editor provides the following formatting options:

- Bold, italic, and underline text
- Text color and background color
- Bulleted and numbered lists
- Text alignment (left, center, right, justify)
- Headings and paragraph styles
- Links and images

Users can toggle between the rich text editor and a simple text input using the format button (📝) in the chat input area.

### 2. GIF Support

Users can search for and send GIFs in their messages using the GIPHY API integration:

- Click the GIF button (🖼️) to open the GIF picker
- Search for GIFs using keywords
- Browse trending GIFs
- Preview and select GIFs to include in messages
- Remove selected GIFs before sending

### 3. Message Reactions

Users can react to messages with emojis:

- Click the reaction button (😀) on any message to open the emoji picker
- Select from common emojis or search for specific ones
- See reaction counts and who has reacted
- Toggle reactions on/off by clicking again

### 4. Translation Capabilities

Users can translate messages to their preferred language:

- Click the translation button (🌐) on any message
- Select from 30+ supported languages
- View translated text alongside the original message
- Close translations when no longer needed

## Components

The chat feature consists of the following components:

### Chat.tsx

The main container component that manages the chat state and renders the message list and input area.

```tsx
// Main chat component that displays messages and input area
const Chat: FC<ChatProps> = ({ socket, currentUser }) => {
  // State management for chat messages and UI
  // Socket event listeners for real-time updates
  // Message sending functionality
}
```

### ChatMessageItem.tsx

Displays individual chat messages with reactions and translation options.

```tsx
// Component for rendering individual chat messages
const ChatMessageItem: FC<ChatMessageItemProps> = ({ message, socket, currentUserId }) => {
  // Message content rendering
  // Reaction handling
  // Translation functionality
}
```

### ChatInput.tsx

Provides the input area with rich text formatting and GIF selection.

```tsx
// Component for message input with rich text and GIF support
const ChatInput: FC<ChatInputProps> = ({ onSendMessage }) => {
  // Rich text editor integration
  // GIF selection
  // Message sending
}
```

### EmojiPicker.tsx

Allows users to select emoji reactions for messages.

```tsx
// Component for selecting emoji reactions
const EmojiPicker: FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  // Emoji categories and search
  // Selection handling
}
```

### GifPicker.tsx

Enables users to search for and select GIFs from GIPHY.

```tsx
// Component for searching and selecting GIFs
const GifPicker: FC<GifPickerProps> = ({ onGifSelect, onClose }) => {
  // GIPHY API integration
  // Search functionality
  // GIF selection
}
```

### TranslationService.tsx

Provides message translation capabilities.

```tsx
// Component for translating messages
const TranslationService: FC<TranslationServiceProps> = ({ 
  messageId, socket, onLanguageSelect, onClose 
}) => {
  // Language selection
  // Translation handling
}
```

## Integration

The chat feature is integrated into the application through the following files:

### ChatContainer.tsx

Connects the Chat component to the application's socket and user state.

```tsx
// Container component that connects Chat to the application
const ChatContainer: FC<ChatContainerProps> = ({ socket, roomId }) => {
  // User state management
  // Socket connection handling
}
```

### Room.tsx

Integrates the ChatContainer into the room interface alongside other components.

```tsx
// Room component with chat integration
const Room: FC<Props> = ({ id }) => {
  // Socket connection
  // Room UI with chat container
}
```

## Server-Side Implementation

### chat.ts

Manages chat state on the server side.

```typescript
// Server-side chat state management
export const initializeChatState = async (roomId: string) => {
  // Initialize chat state for a room
}

export const addChatMessage = async (roomId: string, message: any) => {
  // Add a new message to chat state
}

export const addMessageReaction = async (roomId: string, messageId: string, emoji: string, userId: string) => {
  // Add a reaction to a message
}

export const removeMessageReaction = async (roomId: string, messageId: string, emoji: string, userId: string) => {
  // Remove a reaction from a message
}

export const addMessageTranslation = async (roomId: string, messageId: string, language: string, translation: string) => {
  // Add translation to a message
}
```

### socketio.ts

Handles WebSocket events for chat functionality.

```typescript
// Socket.IO event handlers for chat
socket.on("sendMessage", async (message) => {
  // Handle new message events
})

socket.on("fetchChatHistory", async () => {
  // Handle chat history requests
})

socket.on("addReaction", async (messageId, emoji) => {
  // Handle reaction addition
})

socket.on("removeReaction", async (messageId, emoji) => {
  // Handle reaction removal
})

socket.on("translateMessage", async (messageId, targetLanguage) => {
  // Handle translation requests
})
```

## Data Types

### types.ts

Defines TypeScript interfaces for chat-related data.

```typescript
// Chat message interface
export interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  richContent?: string
  timestamp: number
  gifUrl?: string
  reactions: MessageReaction[]
  translated?: {
    [languageCode: string]: string
  }
}

// Message reaction interface
export interface MessageReaction {
  emoji: string
  count: number
  users: string[]
}

// Chat state interface
export interface ChatState {
  messages: ChatMessage[]
  lastUpdate: number
}
```

## Socket Events

### socket.ts

Defines client-server socket events for chat functionality.

```typescript
// Server to client events
export interface ServerToClientEvents {
  // Existing events...
  chatUpdate: (chatState: ChatState) => void
  newMessage: (message: ChatMessage) => void
  messageReaction: (messageId: string, reactions: ChatMessage["reactions"]) => void
  messageTranslated: (messageId: string, translations: ChatMessage["translated"]) => void
}

// Client to server events
export interface ClientToServerEvents {
  // Existing events...
  sendMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void
  addReaction: (messageId: string, emoji: string) => void
  removeReaction: (messageId: string, emoji: string) => void
  translateMessage: (messageId: string, targetLanguage: string) => void
  fetchChatHistory: () => void
}
```

## Usage Guide

### Sending Messages

1. Type your message in the text input area
2. Use the format button (📝) to toggle rich text formatting
3. Use the GIF button (🖼️) to add a GIF to your message
4. Press Enter or click Send to send your message

### Using Rich Text Formatting

1. Click the format button (📝) to open the rich text editor
2. Use the toolbar to format your text
3. Click the format button again to return to simple text input

### Adding GIFs

1. Click the GIF button (🖼️) to open the GIF picker
2. Search for GIFs or browse trending ones
3. Click on a GIF to select it
4. Send your message with the GIF

### Reacting to Messages

1. Hover over a message and click the reaction button (😀)
2. Select an emoji from the picker
3. Click an existing reaction to add/remove your reaction

### Translating Messages

1. Click the translation button (🌐) on a message
2. Select your desired language
3. View the translated text
4. Click the X to close the translation

## Troubleshooting

### Common Issues

1. **Messages not sending**: Ensure WebSocket connection is established
2. **GIFs not loading**: Check GIPHY API key and network connection
3. **Rich text editor not appearing**: Verify TinyMCE is properly installed
4. **Translations not working**: Check server-side translation service

### Debugging

Check browser console for JavaScript errors and server logs for backend issues.

## Future Enhancements

Potential future improvements to the chat feature:

1. Message threading and replies
2. File attachments and image uploads
3. Voice messages
4. User typing indicators
5. Message search functionality
6. Read receipts
7. Message editing and deletion
8. Emoji and sticker packs
9. Chat moderation tools
10. Chat history export

## Dependencies

- TinyMCE: Rich text editor
- GIPHY API: GIF search and selection
- Socket.IO: Real-time communication
- React: UI components
- TypeScript: Type definitions
