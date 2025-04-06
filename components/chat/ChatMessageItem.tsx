"use client"
import { FC, useState, useRef, useEffect } from "react"
import { ChatMessage } from "../../lib/types"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents, addMessageReaction, removeMessageReaction, translateMessage } from "../../lib/socket"
import EmojiPicker from "./EmojiPicker"
import TranslationService from "./TranslationService"

interface ChatMessageItemProps {
  message: ChatMessage
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
  currentUserId: string
}

const ChatMessageItem: FC<ChatMessageItemProps> = ({ message, socket, currentUserId }) => {
  const [showTranslations, setShowTranslations] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTranslationService, setShowTranslationService] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [messageState, setMessageState] = useState(message)
  const isCurrentUser = message.userId === currentUserId
  const emojiButtonRef = useRef<HTMLDivElement>(null)
  const translationButtonRef = useRef<HTMLDivElement>(null)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  
  const handleReaction = (emoji: string) => {
    const hasReacted = message.reactions.some(
      reaction => reaction.emoji === emoji && reaction.users.includes(currentUserId)
    )
    
    if (hasReacted) {
      removeMessageReaction(socket, message.id, emoji)
    } else {
      addMessageReaction(socket, message.id, emoji)
    }
    setShowEmojiPicker(false)
  }
  
  const handleLanguageSelect = async (languageCode: string) => {
    setTargetLanguage(languageCode)
    setIsTranslating(true)
    setShowTranslations(true)
    setShowTranslationService(false)
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.content,
          targetLanguage: languageCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.translation);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('[Error: Translation failed]');
    } finally {
      setIsTranslating(false);
    }
  };

  // Update messageState when the parent message prop changes
  useEffect(() => {
    setMessageState(message);
  }, [message]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiButtonRef.current && 
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false)
      }
      if (
        translationButtonRef.current && 
        !translationButtonRef.current.contains(event.target as Node)
      ) {
        setShowTranslationService(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // Reset translating state when translations are updated
    if (message.translations && message.translations[targetLanguage]) {
      setIsTranslating(false)
    }
  }, [message.translations, targetLanguage])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className={`
      group flex flex-col space-y-1.5
      ${messageState.userId === currentUserId ? 'items-end' : 'items-start'}
    `}>
      {/* Message Header */}
      <div className={`
        flex items-center gap-2 px-1
        ${messageState.userId === currentUserId ? 'flex-row-reverse' : 'flex-row'}
        animate-fade-slide-down
      `}>
        {messageState.userId !== currentUserId && (
          <div className="relative group/avatar">
            <img
              src={messageState.userAvatar || '/default-avatar.png'}
              alt={messageState.userName}
              className="w-8 h-8 rounded-full ring-2 ring-[#2c2f33] transition-all duration-200 
                       group-hover/avatar:ring-blue-500 group-hover/avatar:scale-110"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full 
                          border-2 border-[#1e2124] transition-transform group-hover/avatar:scale-110"></div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300 hover:text-white cursor-pointer 
                         transition-colors hover:underline decoration-dotted underline-offset-2">
            {messageState.userName}
          </span>
          <span className="text-xs text-gray-500">{formatTime(messageState.timestamp)}</span>
        </div>
      </div>

      {/* Message Content */}
      <div className={`
        group relative flex ${messageState.userId === currentUserId ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[85%]
        animate-fade-slide-up
      `}>
        <div className={`
          relative px-4 py-2.5 rounded-2xl shadow-sm
          ${messageState.userId === currentUserId 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white mr-1' 
            : 'bg-[#2c2f33] text-gray-100 ml-1'
          }
          hover:shadow-lg transition-all duration-200
          ${messageState.userId === currentUserId ? 'rounded-br-sm' : 'rounded-bl-sm'}
        `}>
          {/* Message Text */}
          <div className="relative space-y-2">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{messageState.content}</p>
            
            {/* Translation */}
            {(showTranslations || isTranslating) && (
              <div className="mt-3 pt-3 border-t border-white/10">
                {isTranslating ? (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-gray-300"></div>
                    <span className="animate-pulse">Translating...</span>
                  </div>
                ) : translatedText?.startsWith('[Error:') ? (
                  <p className="text-sm text-red-400/90 bg-red-400/10 px-3 py-2 rounded-lg">
                    {translatedText}
                  </p>
                ) : translatedText ? (
                  <div className="text-sm space-y-1.5">
                    <p className="text-gray-200/90 whitespace-pre-wrap break-words">
                      {translatedText}
                    </p>
                    <p className="text-xs text-gray-400/80 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <span>Translated to {targetLanguage.toUpperCase()}</span>
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* GIF */}
            {message.gifUrl && (
              <div className="mt-2 rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm">
                <img 
                  src={message.gifUrl} 
                  alt="GIF" 
                  className="max-w-[300px] max-h-[200px] object-contain"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className={`
            absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
            transition-all duration-200 scale-95 group-hover:scale-100
            ${messageState.userId === currentUserId ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full mr-2'}
          `}>
            <div className="flex items-center gap-1.5 bg-[#1e2124]/90 backdrop-blur-sm p-1 rounded-lg shadow-lg">
              {/* Translation Button */}
              <div ref={translationButtonRef} className="relative">
                <button
                  onClick={() => setShowTranslationService(!showTranslationService)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg 
                           transition-all duration-200 hover:scale-110"
                  title="Translate message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </button>
                {showTranslationService && (
                  <div className={`
                    absolute z-10 ${messageState.userId === currentUserId ? 'right-0' : 'left-0'} top-full mt-1
                  `}>
                    <TranslationService
                      messageId={message.id}
                      socket={socket}
                      onLanguageSelect={handleLanguageSelect}
                      onClose={() => setShowTranslationService(false)}
                    />
                  </div>
                )}
              </div>

              {/* Emoji Button */}
              <div ref={emojiButtonRef} className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg 
                           transition-all duration-200 hover:scale-110"
                  title="Add reaction"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-1 right-0">
                    <EmojiPicker onEmojiSelect={handleReaction} onClose={() => setShowEmojiPicker(false)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className={`
          flex flex-wrap gap-1.5 mt-2
          ${messageState.userId === currentUserId ? 'justify-end' : 'justify-start'}
          animate-fade-in
        `}>
          {message.reactions.map((reaction, index) => (
            <button
              key={`${reaction.emoji}-${index}`}
              onClick={() => handleReaction(reaction.emoji)}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm
                transition-all duration-200 hover:scale-105
                ${reaction.users.includes(currentUserId)
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                  : 'bg-[#2c2f33] text-gray-300 hover:bg-[#1e2124] hover:text-white'
                }
              `}
            >
              <span className="text-base leading-none">{reaction.emoji}</span>
              <span className="text-xs font-medium">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatMessageItem
