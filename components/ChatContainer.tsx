"use client"
import { FC, useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents } from "../lib/socket"
import { UserState } from "../lib/types"
import Chat from "./chat/Chat"

interface ChatContainerProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
  roomId: string
}

const ChatContainer: FC<ChatContainerProps> = ({ socket, roomId }) => {
  // Find current user from socket connection
  const [currentUser, setCurrentUser] = useState<UserState | null>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  
  useEffect(() => {
    // Listen for room updates to get current user
    const handleRoomUpdate = (room: any) => {
      if (!room || !room.users || !Array.isArray(room.users)) {
        console.error("Invalid room data received:", room);
        return;
      }
      
      const user = room.users.find((u: UserState) => 
        u.socketIds && u.socketIds.includes(socket.id)
      )
      
      if (user) {
        console.log("Current user found:", user.name);
        setCurrentUser(user)
      } else {
        console.log("User not found in room update. Socket ID:", socket.id);
        console.log("Available users:", room.users.map((u: UserState) => ({ name: u.name, ids: u.socketIds })));
      }
    }
    
    // Set up event listener
    socket.on("update", handleRoomUpdate)
    
    // Fetch initial room state
    const fetchRoomState = () => {
      console.log("Fetching room state...");
      socket.emit("fetch")
    }
    
    // Initial fetch
    fetchRoomState()
    
    // Set up retry mechanism
    const intervalId = setInterval(() => {
      if (!currentUser) {
        setConnectionAttempts(prev => prev + 1)
        console.log(`Retry attempt ${connectionAttempts + 1} to fetch user data`)
        fetchRoomState()
        
        // After 5 attempts, try a fallback approach
        if (connectionAttempts >= 5 && !currentUser) {
          console.log("Using fallback user data")
          // Create a fallback user if we can't get the real one
          const fallbackUser: UserState = {
            name: "Guest User",
            avatar: "",
            socketIds: [socket.id],
            uid: socket.id,
            player: {
              playing: { src: [], sub: [] },
              paused: false,
              progress: 0,
              playbackRate: 1,
              loop: false,
              volume: 1,
              muted: false,
              fullscreen: false,
              duration: 0,
              error: null
            }
          }
          setCurrentUser(fallbackUser)
          clearInterval(intervalId)
        }
      } else {
        clearInterval(intervalId)
      }
    }, 2000) // Try every 2 seconds
    
    return () => {
      socket.off("update", handleRoomUpdate)
      clearInterval(intervalId)
    }
  }, [socket, connectionAttempts, currentUser])
  
  if (!currentUser) {
    return (
      <div className="flex flex-col h-full border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-3 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Chat</h2>
        </div>
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400">Connecting to chat...</p>
            {connectionAttempts > 2 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                This is taking longer than expected...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  return <Chat socket={socket} currentUser={currentUser} />
}

export default ChatContainer
