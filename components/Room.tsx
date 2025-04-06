"use client"
import { FC, useState, useEffect, useRef } from "react"
import Player from "./player/Player"
import { createClientSocket } from "../lib/socket"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents } from "../lib/socket"
import { ChatMessage, ChatState, UserState } from "../lib/types"
import Button from "./action/Button"
import IconLoop from "./icon/IconLoop"
import InputUrl from "./input/InputUrl"
import UserList from "./user/UserList"
import ChatContainer from "./ChatContainer"
import PlaylistMenu from './playlist/PlaylistMenu'

interface Props {
  id: string
}

const Room: FC<Props> = ({ id }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [connected, setConnected] = useState(false)
  const [url, setUrl] = useState("")
  const [showChat, setShowChat] = useState(true)
  const [serverTime, setServerTime] = useState<number>(0)
  const [isHost, setIsHost] = useState(false)
  const lastSyncEmit = useRef<number>(0)
  const syncInterval = 1000 // Sync interval in milliseconds

  useEffect(() => {
    const newSocket = createClientSocket(id)
    
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setConnected(true);
      
      // Join room
      newSocket.emit('joinRoom', { 
        roomId: id,
        userName: 'Anonymous'
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket");
      newSocket.close();
    }
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdate = (roomData: any) => {
      if (roomData.hostId === socket.id) {
        setIsHost(true);
      }
    };

    socket.on("roomUpdate", handleRoomUpdate);

    return () => {
      socket.off("roomUpdate", handleRoomUpdate);
    };
  }, [socket]);

  const handleTimeUpdate = (time: number) => {
    if (isHost && socket && Date.now() - lastSyncEmit.current >= syncInterval) {
      socket.emit("videoSync", time);
      lastSyncEmit.current = Date.now();
    }
  };

  const handleSyncRequest = () => {
    if (socket) {
      socket.emit("requestSync");
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Connecting to room...</p>
      </div>
    );
  }

  if (!socket) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Video Player */}
        <div className="flex-grow">
          <Player
            roomId={id}
            socket={socket}
            fullHeight={false}
          />
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <Button
            tooltip="Do a forced manual sync"
            className="p-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => {
              console.log("Fetching update", socket?.id)
              socket?.emit("fetch")
            }}
          >
            <IconLoop className="hover:animate-spin" />
            <span className="hidden sm:inline">Manual sync</span>
          </Button>
          
          <InputUrl
            className="flex-1 min-w-[200px]"
            url={url}
            placeholder="Play url now"
            tooltip="Play given url now"
            onChange={setUrl}
            onSubmit={() => {
              console.log("Requesting", url, "now")
              socket?.emit("playUrl", url)
              setUrl("")
            }}
          >
            Play
          </InputUrl>
        </div>
        
        {/* User List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <UserList socket={socket} />
        </div>
      </div>
      
      <div className="lg:w-[400px] flex flex-col gap-4">
        {/* Chat Toggle (Mobile) */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
        </div>
        
        {/* Playlist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <PlaylistMenu socket={socket} />
        </div>
        
        {/* Chat */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${showChat ? 'block' : 'hidden lg:block'}`}>
          <ChatContainer socket={socket} roomId={id} />
        </div>
      </div>
    </div>
  )
}

export default Room
