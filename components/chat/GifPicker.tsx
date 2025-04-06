"use client"
import { FC, useState, useEffect } from "react"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents } from "../../lib/socket"

interface GifPickerProps {
  onGifSelect: (url: string) => void
  onClose: () => void
}

const GifPicker: FC<GifPickerProps> = ({ onGifSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [trendingGifs, setTrendingGifs] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Validate API key on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY
    if (!apiKey) {
      console.error("No Giphy API key found!")
      setError("Giphy API key is missing. Please check your configuration.")
      return
    }
    console.log("Giphy API key found (first 5 chars):", apiKey.substring(0, 5))
    fetchTrendingGifs()
  }, [])

  const fetchTrendingGifs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY
      if (!apiKey) {
        throw new Error("Giphy API key is missing")
      }

      const url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=12&rating=g`
      console.log("Fetching trending GIFs from:", url.replace(apiKey, 'API_KEY'))
      
      const response = await fetch(url)
      console.log("Trending response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("Trending error data:", errorData)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData?.message || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log("Trending response meta:", data.meta)
      console.log("Number of trending GIFs:", data.data?.length || 0)
      
      if (data.data && Array.isArray(data.data)) {
        setTrendingGifs(data.data)
        if (data.data.length === 0) {
          setError("No trending GIFs found. Please try again later.")
        }
      } else {
        console.error("Invalid trending response format:", data)
        throw new Error("Invalid response format from Giphy API")
      }
    } catch (error: any) {
      console.error("Error fetching trending GIFs:", error)
      setError(`Failed to load trending GIFs: ${error.message}`)
      setTrendingGifs([])
    } finally {
      setIsLoading(false)
    }
  }

  const searchGifs = async () => {
    if (!searchTerm.trim()) return
    
    setIsLoading(true)
    setError(null)
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY
      if (!apiKey) {
        throw new Error("Giphy API key is missing")
      }

      const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(searchTerm)}&limit=12&rating=g`
      console.log("Searching GIFs with URL:", url.replace(apiKey, 'API_KEY'))
      console.log("Search term:", searchTerm)
      
      const response = await fetch(url)
      console.log("Search response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("Search error data:", errorData)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData?.message || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log("Search response meta:", data.meta)
      console.log("Number of search results:", data.data?.length || 0)
      
      if (data.data && Array.isArray(data.data)) {
        setResults(data.data)
        if (data.data.length === 0) {
          setError("No GIFs found for your search. Try a different term!")
        }
      } else {
        console.error("Invalid search response format:", data)
        throw new Error("Invalid response format from Giphy API")
      }
    } catch (error: any) {
      console.error("Error searching for GIFs:", error)
      setError(`Failed to search for GIFs: ${error.message}`)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchGifs()
    }
  }

  const handleGifSelect = (url: string) => {
    onGifSelect(url)
    onClose()
  }

  const displayGifs = searchTerm ? results : trendingGifs

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Select a GIF</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for GIFs..."
              className="flex-grow p-2 border rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={searchGifs}
              className="px-4 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              {error}
            </div>
          ) : (
            <>
              <h4 className="text-sm font-medium mb-2">
                {searchTerm ? 'Search Results' : 'Trending GIFs'}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {displayGifs.map((gif: any, index: number) => (
                  <div 
                    key={index}
                    className="aspect-video relative overflow-hidden rounded-md cursor-pointer hover:opacity-80"
                    onClick={() => handleGifSelect(gif.images.fixed_height.url)}
                  >
                    <img
                      src={gif.images.fixed_height_small.url}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
                {displayGifs.length === 0 && (
                  <div className="col-span-3 text-center py-4 text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No GIFs found. Try a different search term.' : 'Failed to load trending GIFs.'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="p-3 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
          Powered by GIPHY
        </div>
      </div>
    </div>
  )
}

export default GifPicker
