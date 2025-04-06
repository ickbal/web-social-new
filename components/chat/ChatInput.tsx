"use client"
import { FC, useState, useRef, useEffect } from "react"
import { Editor } from '@tinymce/tinymce-react'
import GifPicker from "./GifPicker"

interface ChatInputProps {
  onSendMessage: (content: string, richContent?: string, gifUrl?: string) => void
}

const ChatInput: FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("")
  const [richMessage, setRichMessage] = useState("")
  const [showRichEditor, setShowRichEditor] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [selectedGif, setSelectedGif] = useState<string | null>(null)
  const editorRef = useRef<any>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Focus input on mount
  useEffect(() => {
    if (!showRichEditor && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showRichEditor])

  const handleSendMessage = () => {
    const content = showRichEditor ? editorRef.current.getContent({ format: 'text' }) : message
    const richContent = showRichEditor ? editorRef.current.getContent() : undefined
    
    if (content.trim() || selectedGif) {
      onSendMessage(content, richContent, selectedGif || undefined)
      setMessage("")
      setRichMessage("")
      setSelectedGif(null)
      if (editorRef.current) {
        editorRef.current.setContent("")
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleGifSelect = (url: string) => {
    setSelectedGif(url)
    setShowGifPicker(false)
  }

  return (
    <div className="space-y-2">
      {/* Message input area */}
      {!showRichEditor ? (
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full p-2 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows={2}
        />
      ) : (
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={richMessage}
          init={{
            height: 200,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
        />
      )}

      {/* Selected GIF preview */}
      {selectedGif && (
        <div className="relative">
          <img 
            src={selectedGif} 
            alt="Selected GIF" 
            className="max-h-[150px] rounded-md" 
          />
          <button 
            onClick={() => setSelectedGif(null)}
            className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1"
            title="Remove GIF"
          >
            ✕
          </button>
        </div>
      )}

      {/* GIF Picker Modal */}
      {showGifPicker && (
        <GifPicker 
          onGifSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
        />
      )}

      {/* Action buttons */}
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowRichEditor(!showRichEditor)}
            className={`p-2 rounded-md ${
              showRichEditor 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            title={showRichEditor ? "Use simple editor" : "Use rich text editor"}
          >
            <span role="img" aria-label="Format">📝</span>
          </button>
          <button
            onClick={() => setShowGifPicker(!showGifPicker)}
            className={`p-2 rounded-md ${
              showGifPicker 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            title="Add GIF"
          >
            <span role="img" aria-label="GIF">🖼️</span>
          </button>
        </div>
        
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatInput
