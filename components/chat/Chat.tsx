"use client"
import { FC, useState, useEffect, useRef } from "react"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents } from "../../lib/socket"
import { ChatMessage, ChatState, UserState } from "../../lib/types"
import ChatMessageItem from "./ChatMessageItem"
import ChatInput from "./ChatInput"
import { sendChatMessage } from "../../lib/socket"

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
  currentUser: UserState
}

const Chat: FC<Props> = ({ socket, currentUser }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    lastUpdate: 0,
    isTyping: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [loadingAttempts, setLoadingAttempts] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("Chat component mounted with user:", currentUser.name);
    
    // Listen for chat updates
    const handleChatUpdate = (newChatState: ChatState) => {
      console.log("Chat update received:", newChatState);
      setChatState(newChatState)
      setIsLoading(false)
    }

    // Listen for new messages
    const handleNewMessage = (message: ChatMessage) => {
      console.log("New message received:", message);
      setChatState((prevState) => ({
        messages: [...prevState.messages, message],
        lastUpdate: Date.now(),
        isTyping: prevState.isTyping
      }))
      
      // Check if chat is not at bottom to increment unread count
      const container = chatContainerRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
        if (!isAtBottom && message.userId !== currentUser.uid) {
          setUnreadCount(prev => prev + 1);
        }
      }
    }
    
    // Listen for message reactions
    const handleMessageReaction = (messageId: string, updatedMessage: ChatMessage) => {
      setChatState((prevState) => ({
        messages: prevState.messages.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        ),
        lastUpdate: Date.now(),
        isTyping: prevState.isTyping
      }))
    }
    
    // Listen for message translations
    const handleMessageTranslation = (messageId: string, translations: ChatMessage["translations"]) => {
      setChatState((prevState) => ({
        messages: prevState.messages.map(msg => 
          msg.id === messageId ? { ...msg, translations } : msg
        ),
        lastUpdate: Date.now(),
        isTyping: prevState.isTyping
      }))
    }
    
    // Set up event listeners
    socket.on("chatUpdate", handleChatUpdate)
    socket.on("messageReceived", handleNewMessage)
    socket.on("messageReactionUpdate", handleMessageReaction)
    socket.on("messageTranslated", handleMessageTranslation)
    
    // Fetch chat history
    const fetchChatHistory = () => {
      console.log("Fetching chat history...");
      socket.emit("fetchChatHistory")
    }
    
    // Initial fetch
    fetchChatHistory()
    
    // Set up retry mechanism for chat history
    const intervalId = setInterval(() => {
      if (isLoading) {
        setLoadingAttempts(prev => prev + 1)
        console.log(`Retry attempt ${loadingAttempts + 1} to fetch chat history`)
        fetchChatHistory()
        
        // After 3 attempts, just show empty chat
        if (loadingAttempts >= 3) {
          console.log("Giving up on loading chat history, showing empty chat")
          setIsLoading(false)
          clearInterval(intervalId)
        }
      } else {
        clearInterval(intervalId)
      }
    }, 2000) // Try every 2 seconds
    
    // Cleanup listeners on unmount
    return () => {
      socket.off("chatUpdate", handleChatUpdate)
      socket.off("messageReceived", handleNewMessage)
      socket.off("messageReactionUpdate", handleMessageReaction)
      socket.off("messageTranslated", handleMessageTranslation)
      clearInterval(intervalId)
    }
  }, [socket, currentUser, isLoading, loadingAttempts])

  // Handle scroll to bottom and unread messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setUnreadCount(0)
  }

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    if (isAtBottom) {
      setUnreadCount(0);
    }
  }

  const handleSendMessage = (content: string, richContent?: string, gifUrl?: string) => {
    console.log("Sending message:", content);
    sendChatMessage(
      socket,
      content,
      richContent ? "rich" : gifUrl ? "gif" : "text",
      gifUrl
    )
    scrollToBottom()
  }

  return (
    <div className="flex flex-col h-[500px] bg-[#1e2124] text-white rounded-xl shadow-2xl overflow-hidden border border-[#2c2f33]/50">
      {/* Chat Header */}
      <div className="relative p-4 bg-gradient-to-r from-[#2c2f33] to-[#23272a] border-b border-[#1e2124]/50">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1e2124]"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Chat Room
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>{chatState.messages.length} messages</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#1e2124] custom-scrollbar"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center space-y-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
              </div>
              <p className="text-gray-400 animate-pulse">Loading messages...</p>
            </div>
          </div>
        ) : chatState.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-300">No messages yet</p>
              <p className="text-sm text-gray-500">Be the first to start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {chatState.messages.map((message, index) => (
                <div key={message.id} 
                     className="animate-fade-slide-up"
                     style={{ animationDelay: `${index * 50}ms` }}>
                  <ChatMessageItem 
                    message={message}
                    socket={socket}
                    currentUserId={currentUser.uid}
                  />
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Unread Messages Indicator */}
      {unreadCount > 0 && (
        <div 
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
          onClick={scrollToBottom}
        >
          <button className="px-4 py-2 bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm text-white rounded-full 
                           shadow-lg flex items-center gap-2 transition-all hover:scale-105">
            <span className="text-sm font-medium">{unreadCount} new message{unreadCount > 1 ? 's' : ''}</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 bg-[#2c2f33] border-t border-[#1e2124]/50">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  )
}

export default Chat

