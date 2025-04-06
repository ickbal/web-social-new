export interface Subtitle {
  src: string
  lang: string
}

export interface MediaOption {
  src: string
  resolution: string
}

export interface MediaElement {
  title?: string
  sub: Subtitle[]
  src: MediaOption[]
}

export interface Playlist {
  items: MediaElement[]
  currentIndex: number
}

export interface TargetState {
  playlist: Playlist
  playing: MediaElement
  paused: boolean
  progress: number
  playbackRate: number
  loop: boolean
  lastSync: number
}

export interface PlayerState extends TargetState {
  currentSrc: MediaOption
  currentSub: Subtitle
  volume: number
  muted: boolean
  fullscreen: boolean
  error: any
  duration: number
}

export interface UserState {
  uid: string
  name: string
  avatar?: string
  isHost?: boolean
  player: PlayerState
  socketIds: string[]
}

export enum Command {
  play = "play",
  pause = "pause",
  seek = "seek",
  playbackRate = "playbackRate",
  playSrc = "playSrc",
}

export interface CommandLog {
  command: Command
  userId: string
  target?: MediaElement | Playlist | string | number
  time: number
}

export interface RoomState {
  serverTime: number
  id: string
  ownerId: string
  users: UserState[]
  targetState: TargetState
  commandHistory: CommandLog[]
  chatState?: ChatState
}

// New chat-related types
export interface MessageReaction {
  emoji: string
  count: number
  users: string[] // UIDs of users who reacted
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  richContent?: string // HTML content for rich text
  timestamp: number
  gifUrl?: string
  reactions: MessageReaction[]
  translations?: {
    [languageCode: string]: string
  }
}

export enum ReactionType {
  like = "like",
  love = "love",
  laugh = "laugh",
  wow = "wow",
  sad = "sad",
  angry = "angry"
}

export interface Reaction {
  id: string
  userId: string
  userName: string
  type: ReactionType
  timestamp: number
  position: {
    x: number
    y: number
  }
}

export interface ChatState {
  messages: ChatMessage[]
  lastUpdate: number
  isTyping: {
    [userId: string]: boolean
  }
}
