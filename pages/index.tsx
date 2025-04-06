import { useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetcher } from '../lib/fetcher'
import { Tooltip } from 'react-tooltip'
import dynamic from 'next/dynamic'

const ImpossibleBox = dynamic(() => import('../components/animation/ImpossibleBox'), {
  ssr: false
})

export default function Home() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')
  const { data } = useSWR('/api/stats', fetcher)

  const isValidRoomId = roomId.length >= 4

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidRoomId) {
      router.push(`/room/${roomId}`)
    }
  }

  const generateRoom = async () => {
    try {
      const response = await fetch('/api/generate')
      const data = await response.json()
      if (data.roomId && data.roomId.length >= 4) {
        router.push(`/room/${data.roomId}`)
      } else {
        console.error('Invalid room ID generated:', data.roomId)
      }
    } catch (error) {
      console.error('Failed to generate room:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <ImpossibleBox />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-md mx-auto backdrop-blur-lg bg-black/30 p-8 rounded-2xl shadow-2xl border border-cyan-500/20">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Watch Party
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Watch videos together with friends in perfect sync
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
                placeholder="Enter room ID"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                minLength={4}
              />
              <p className="mt-2 text-sm text-gray-500">
                Minimum 4 characters required
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={!isValidRoomId}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  isValidRoomId
                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                data-tooltip-id="button-tooltip"
                data-tooltip-content={isValidRoomId ? 'Join room' : 'Invalid room ID'}
              >
                Join Room
              </button>

              <button
                type="button"
                onClick={generateRoom}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                data-tooltip-id="button-tooltip"
                data-tooltip-content="Generate a random room ID"
              >
                Create Room
              </button>
            </div>
          </form>

          {data && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Active Rooms: {data.rooms}</span>
                <span>Connected Users: {data.users}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tooltip id="button-tooltip" />
    </div>
  )
}
