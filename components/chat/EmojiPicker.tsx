"use client"
import { FC, useState, useRef } from "react"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents, addMessageReaction, removeMessageReaction } from "../../lib/socket"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

const EmojiPicker: FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const pickerRef = useRef<HTMLDivElement>(null)

  // Common emoji categories
  const categories = [
    {
      name: "Frequently Used",
      emojis: ["👍", "❤️", "😂", "🎉", "🔥", "👏", "😍", "🙏", "👌", "😊"]
    },
    {
      name: "Smileys & Emotion",
      emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "😍", "🥰", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐"]
    },
    {
      name: "Gestures & People",
      emojis: ["👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄"]
    },
    {
      name: "Animals & Nature",
      emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛"]
    },
    {
      name: "Food & Drink",
      emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐"]
    },
    {
      name: "Activities",
      emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷"]
    },
    {
      name: "Objects",
      emojis: ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️"]
    },
    {
      name: "Symbols",
      emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐"]
    }
  ]

  // Filter emojis based on search term
  const filteredCategories = searchTerm.trim() 
    ? categories.map(category => ({
        name: category.name,
        emojis: category.emojis.filter(emoji => 
          emoji.includes(searchTerm) || 
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.emojis.length > 0)
    : categories

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg w-64 max-h-80 overflow-y-auto z-10"
    >
      <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b dark:border-gray-700">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search emojis..."
          className="w-full p-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <div className="p-2">
        {filteredCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-3">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{category.name}</h4>
            <div className="grid grid-cols-8 gap-1">
              {category.emojis.map((emoji, emojiIndex) => (
                <button
                  key={`${categoryIndex}-${emojiIndex}`}
                  onClick={() => {
                    onEmojiSelect(emoji)
                    onClose()
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded text-xl"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No emojis found
          </div>
        )}
      </div>
    </div>
  )
}

export default EmojiPicker
