import * as socketIo from "socket.io"
import { Server } from "socket.io"
import { NextApiRequest, NextApiResponse } from "next"
import { ClientToServerEvents, ServerToClientEvents } from "../../lib/socket"
import {
  decUsers,
  deleteRoom,
  getRoom,
  incUsers,
  roomExists,
  setRoom,
} from "../../lib/cache"
import { createNewRoom, createNewUser, updateLastSync } from "../../lib/room"
import { ChatState, Playlist, Reaction, ReactionType, RoomState, UserState } from "../../lib/types"
import { isUrl } from "../../lib/utils"
import { v4 as uuidv4 } from 'uuid'
import { addMessageReaction, createNewMessage, removeMessageReaction } from "../../lib/chat"
import { translateText } from "../../lib/translation"

const ioHandler = (_: NextApiRequest, res: NextApiResponse) => {
  // @ts-ignore
  if (res.socket !== null && "server" in res.socket && !res.socket.server.io) {
    console.log("*First use, starting socket.io")

    const io = new Server<ClientToServerEvents, ServerToClientEvents>(
      // @ts-ignore
      res.socket.server,
      {
      path: "/api/socketio",
      }
    )

    const broadcast = async (room: string | RoomState) => {
      const roomId = typeof room === "string" ? room : room.id

      if (typeof room !== "string") {
        await setRoom(roomId, room)
      } else {
        const d = await getRoom(roomId)
        if (d === null) {
          throw Error("Impossible room state of null for room: " + roomId)
        }
        room = d
      }

      room.serverTime = new Date().getTime()
      io.to(roomId).emit("update", room)
    }

    io.on(
      "connection",
      async (
        socket: socketIo.Socket<ClientToServerEvents, ServerToClientEvents>
      ) => {
        if (
          !("roomId" in socket.handshake.query) ||
          typeof socket.handshake.query.roomId !== "string"
        ) {
          socket.disconnect()
          return
        }

        const roomId = socket.handshake.query.roomId.toLowerCase()
        const log = (...props: any[]) => {
          console.log(
            "[" + new Date().toUTCString() + "][room " + roomId + "]",
            socket.id,
            ...props
          )
        }

        if (!(await roomExists(roomId))) {
          await createNewRoom(roomId, socket.id)
          log("created room")
        }

        socket.join(roomId)
        await incUsers()
        log("joined")

        // Add joinRoom event handler
        socket.on("joinRoom", async (data: { roomId: string, userName: string }) => {
          log("joinRoom event received", data);
          
          const room = await getRoom(roomId);
          if (!room) {
            return log("Room not found for join event");
          }
          
          // Find or create user
          let user = room.users.find(u => u.socketIds[0] === socket.id);
          
          if (!user) {
            // Create new user if not found
            await createNewUser(roomId, socket.id);
            user = room.users.find(u => u.socketIds[0] === socket.id);
            
            if (!user) {
              return log("Failed to create user");
            }
          }
          
          // Update user info
          if (data.userName) {
            user.name = data.userName;
          }
          
          await setRoom(roomId, room);

          // Send updated room data to all clients
          io.to(roomId).emit("roomUpdate", { 
            users: room.users,
            hostId: room.ownerId
          });

          log("user joined room");
        });

        await createNewUser(roomId, socket.id)

        // Initialize chat state if it doesn't exist
        const room = await getRoom(roomId)
        if (room && !room.chatState) {
          room.chatState = {
            messages: [],
            isTyping: {},
            lastUpdate: new Date().getTime()
          }
        await setRoom(roomId, room)
        }

        socket.on("disconnect", async () => {
          await decUsers()
          log("disconnected")
          const room = await getRoom(roomId)
          if (room === null) return

          room.users = room.users.filter(
            (user) => user.socketIds[0] !== socket.id
          )
          if (room.users.length === 0) {
            await deleteRoom(roomId)
            log("deleted empty room")
          } else {
            if (room.ownerId === socket.id) {
              room.ownerId = room.users[0].uid
            }
            await broadcast(room)
          }
        })

        // New handler for reactions
        socket.on("sendReaction", async (type: ReactionType) => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Sending reaction for non existing room:" + roomId)
          }
          
          const user = room.users.find(u => u.socketIds[0] === socket.id)
          if (!user) {
            return log("User not found for reaction")
          }
          
          log("reaction sent", type)
          
          const reaction: Reaction = {
            id: uuidv4(),
            userId: user.uid,
            userName: user.name,
            type: type,
            timestamp: new Date().getTime(),
            position: {
              x: Math.random() * 80 + 10, // 10% to 90% of width
              y: Math.random() * 80 + 10, // 10% to 90% of height
            }
          }
          
          // Broadcast the reaction to all users in the room
          io.to(roomId).emit("reactionReceived", reaction)
        })

        // Chat message handler
        socket.on("sendMessage", async (content: string, contentType: 'text' | 'rich' | 'gif', gifUrl?: string) => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Sending message for non existing room:" + roomId)
          }
          
          const user = room.users.find(u => u.socketIds[0] === socket.id)
          if (!user) {
            return log("User not found for message")
          }
          
          log("message sent", contentType)
          
          const message = createNewMessage(
            user.uid,
            user.name,
            user.avatar || '',
            content,
            contentType,
            gifUrl || undefined
          )
          
          // Add message to chat state
          if (!room.chatState) {
            room.chatState = {
              messages: [message],
              isTyping: {},
              lastUpdate: new Date().getTime()
            }
          } else {
            room.chatState.messages.push(message)
            room.chatState.lastUpdate = new Date().getTime()
          }
          
          await setRoom(roomId, room)
          
          // Broadcast the message to all users in the room
          io.to(roomId).emit("messageReceived", message)
        })

        // Typing indicator handler
        socket.on("setTyping", async (isTyping: boolean) => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Setting typing for non existing room:" + roomId)
          }
          
          const user = room.users.find(u => u.socketIds[0] === socket.id)
          if (!user) {
            return log("User not found for typing")
          }
          
          if (isTyping) {
            io.to(roomId).emit("userTyping", user.uid, user.name)
          }
        })

        // Message reaction handlers
        socket.on("addMessageReaction", async (messageId: string, emoji: string) => {
          const room = await getRoom(roomId)
          if (room === null || !room.chatState) {
            throw new Error("Adding reaction for non existing room:" + roomId)
          }
          
          const user = room.users.find(u => u.socketIds[0] === socket.id)
          if (!user) {
            return log("User not found for message reaction")
          }
          
          // Find the message
          const messageIndex = room.chatState.messages.findIndex(m => m.id === messageId)
          if (messageIndex === -1) {
            return log("Message not found for reaction")
          }
          
          // Add reaction to message
          const updatedMessage = addMessageReaction(
            room.chatState.messages[messageIndex],
            emoji,
            user.uid,
            user.name
          )
          
          room.chatState.messages[messageIndex] = updatedMessage
          await setRoom(roomId, room)
          
          // Broadcast the updated message
          io.to(roomId).emit("messageReactionUpdate", messageId, updatedMessage)
        })

        // Translation handler
        socket.on("translateMessage", async (messageId: string, targetLanguage: string) => {
          const room = await getRoom(roomId);
          if (room === null || !room.chatState) {
            throw new Error("Translating message for non existing room:" + roomId);
          }
          
          // Find the message
          const message = room.chatState.messages.find(m => m.id === messageId);
          if (!message) {
            return log("Message not found for translation");
          }

          try {
            // Translate the message content
            const translatedText = await translateText(message.content, targetLanguage);
            
            // Initialize translations object if it doesn't exist
            if (!message.translations) {
              message.translations = {};
            }
            
            // Add the translation
            message.translations[targetLanguage] = translatedText;
            
            // Save the updated room state
            await setRoom(roomId, room);
            
            // Emit the translation to all users in the room
            io.to(roomId).emit("messageTranslated", messageId, message.translations);
            
            log("message translated", messageId, targetLanguage);
          } catch (error: any) {
            console.error("Translation error:", error);
            
            // Send error message as translation
            if (!message.translations) {
              message.translations = {};
            }
            message.translations[targetLanguage] = `[Error: ${error.message}]`;
            
            // Emit the error to all users
            io.to(roomId).emit("messageTranslated", messageId, message.translations);
          }
        });

        socket.on("removeMessageReaction", async (messageId: string, emoji: string) => {
          const room = await getRoom(roomId)
          if (room === null || !room.chatState) {
            throw new Error("Removing reaction for non existing room:" + roomId)
          }
          
          const user = room.users.find(u => u.socketIds[0] === socket.id)
          if (!user) {
            return log("User not found for message reaction")
          }
          
          // Find the message
          const messageIndex = room.chatState.messages.findIndex(m => m.id === messageId)
          if (messageIndex === -1) {
            return log("Message not found for reaction")
          }
          
          // Remove reaction from message
          const updatedMessage = removeMessageReaction(
            room.chatState.messages[messageIndex],
            emoji,
            user.uid
          )
          
          room.chatState.messages[messageIndex] = updatedMessage
          await setRoom(roomId, room)
          
          // Broadcast the updated message
          io.to(roomId).emit("messageReactionUpdate", messageId, updatedMessage)
        })

        // Fetch chat history
        socket.on("fetchChatHistory", async () => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Fetching chat for non existing room:" + roomId)
          }
          
          if (room.chatState) {
            socket.emit("chatUpdate", room.chatState)
          } else {
            socket.emit("chatUpdate", { 
              messages: [], 
              isTyping: {},
              lastUpdate: new Date().getTime()
            })
          }
        })

        socket.on("setPaused", async (paused) => {
          let room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Setting pause for non existing room:" + roomId)
          }
          log("set paused to", paused)

          room = updateLastSync(room)
          room.targetState.paused = paused
          await broadcast(room)
        })

        socket.on("setLoop", async (loop) => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Setting loop for non existing room:" + roomId)
          }
          log("set loop to", loop)

          room.targetState.loop = loop
          await broadcast(updateLastSync(room))
        })

        socket.on("setProgress", async (progress) => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Setting progress for non existing room:" + roomId)
          }

          room.users = room.users.map((user) => {
            if (user.socketIds[0] === socket.id) {
              user.player.progress = progress
            }
            return user
          })

          await broadcast(room)
        })

        socket.on("setPlaybackRate", async (playbackRate) => {
          let room = await getRoom(roomId)
          if (room === null) {
            throw new Error(
              "Setting playbackRate for non existing room:" + roomId
            )
          }
          log("set playbackRate to", playbackRate)

          room = updateLastSync(room)
          room.targetState.playbackRate = playbackRate
          await broadcast(room)
        })

        socket.on("seek", async (progress) => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Setting progress for non existing room:" + roomId)
          }
          log("seeking to", progress)

          room.targetState.progress = progress
          room.targetState.lastSync = new Date().getTime() / 1000
          await broadcast(room)
        })

        socket.on("playEnded", async () => {
          let room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Play ended for non existing room:" + roomId)
          }
          log("playback ended")

          if (room.targetState.loop) {
            room.targetState.progress = 0
            room.targetState.paused = false
          } else if (
            room.targetState.playlist.currentIndex + 1 <
            room.targetState.playlist.items.length
          ) {
            room.targetState.playing =
              room.targetState.playlist.items[
                room.targetState.playlist.currentIndex + 1
              ]
            room.targetState.playlist.currentIndex += 1
            room.targetState.progress = 0
            room.targetState.paused = false
          } else {
            room.targetState.progress =
              room.users.find((user) => user.socketIds[0] === socket.id)?.player
                .progress || 0
            room.targetState.paused = true
          }
          room.targetState.lastSync = new Date().getTime() / 1000
          await broadcast(room)
        })

        socket.on("playAgain", async () => {
          let room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Play again for non existing room:" + roomId)
          }
          log("play same media again")

          room.targetState.progress = 0
          room.targetState.paused = false
          room.targetState.lastSync = new Date().getTime() / 1000
          await broadcast(room)
        })

        socket.on("playItemFromPlaylist", async (index) => {
          let room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Play ended for non existing room:" + roomId)
          }

          if (index < 0 || index >= room.targetState.playlist.items.length) {
            return log(
              "out of index:",
              index,
              "playlist.length:",
              room.targetState.playlist.items.length
            )
          }

          log("playing item", index, "from playlist")
          room.targetState.playing = room.targetState.playlist.items[index]
          room.targetState.playlist.currentIndex = index
          room.targetState.progress = 0
          room.targetState.lastSync = new Date().getTime() / 1000
          await broadcast(room)
        })

        socket.on("updatePlaylist", async (playlist: Playlist) => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Setting playlist for non existing room:" + roomId)
          }
          log("playlist update", playlist)

          if (
            playlist.currentIndex < -1 ||
            playlist.currentIndex >= playlist.items.length
          ) {
            return log(
              "out of index:",
              playlist.currentIndex,
              "playlist.length:",
              playlist.items.length
            )
          }

          room.targetState.playlist = playlist
          await broadcast(room)
        })

        socket.on("updateUser", async (user: UserState) => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error("Setting user for non existing room:" + roomId)
          }
          log("user update", user)

          room.users = room.users.map((u) => {
            if (u.socketIds[0] !== socket.id) {
              return u
            }
            if (u.avatar !== user.avatar) {
              u.avatar = user.avatar
            }
            if (u.name !== user.name) {
              u.name = user.name
            }
            return u
          })

          await broadcast(room)
        })

        socket.on("playUrl", async (url) => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error(
              "Impossible non existing room, cannot send anything:" + roomId
            )
          }
          log("playing url", url)

          if (!isUrl(url)) {
            return
          }

          room.targetState.playing = {
            src: [{ src: url, resolution: "" }],
            sub: [],
          }
          room.targetState.playlist.currentIndex = -1
          room.targetState.progress = 0
          room.targetState.lastSync = new Date().getTime() / 1000
          await broadcast(room)
        })

        socket.on("fetch", async () => {
          const room = await getRoom(roomId)
          if (room === null) {
            throw new Error(
              "Impossible non existing room, cannot send anything:" + roomId
            )
          }

          room.serverTime = new Date().getTime()
          socket.emit("update", room)
        })
      }
    )

    // @ts-ignore
    res.socket.server.io = io
  }

  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default ioHandler
