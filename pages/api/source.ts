import type { NextApiRequest, NextApiResponse } from "next"
import { isValidVideoUrl } from "../../utils"
import { MediaInfo } from "../../lib/media-sources"

// YouTube API key - you'll need to add this to your .env file
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MediaInfo | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const url = typeof req.body === "string" ? req.body : req.body?.url

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Invalid URL" })
    }

    // Check if it's a direct video URL
    if (isValidVideoUrl(url)) {
      return res.status(200).json({
        title: "Direct Video",
        sources: [{
          name: "Direct Source",
          url,
          type: "video/mp4",
          format: "mp4"
        }]
      })
    }

    // Extract video ID based on URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      return res.status(400).json({ error: "Could not extract video ID from URL" })
    }

    // Handle different video platforms
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ error: "YouTube API key not configured" })
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
      )

      if (!response.ok) {
        throw new Error("YouTube API request failed")
      }

      const data = await response.json()
      if (!data.items || data.items.length === 0) {
        return res.status(404).json({ error: "Video not found" })
      }

      const video = data.items[0]
      return res.status(200).json({
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high.url,
        duration: parseDuration(video.contentDetails.duration),
        sources: [{
          name: "YouTube",
          url: `https://www.youtube.com/embed/${videoId}`,
          type: "video/mp4",
          format: "mp4"
        }]
      })
    }

    if (url.includes("vimeo.com")) {
      if (!VIMEO_ACCESS_TOKEN) {
        return res.status(500).json({ error: "Vimeo access token not configured" })
      }

      const response = await fetch(
        `https://api.vimeo.com/videos/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Vimeo API request failed")
      }

      const data = await response.json()
      return res.status(200).json({
        title: data.name,
        description: data.description,
        thumbnail: data.pictures.base_link,
        duration: data.duration,
        sources: [{
          name: "Vimeo",
          url: `https://player.vimeo.com/video/${videoId}`,
          type: "video/mp4",
          format: "mp4"
        }]
      })
    }

    // For other platforms, try using a video extraction service as fallback
    const response = await fetch("https://api.videograbber.net/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        format: "mp4",
        quality: "best",
      }),
    })

    if (!response.ok) {
      throw new Error("Video extraction service failed")
    }

    const data = await response.json()
    if (data.error) {
      return res.status(400).json({ error: data.error })
    }

    return res.status(200).json({
      title: data.title || "Video",
      description: data.description,
      thumbnail: data.thumbnail,
      duration: data.duration,
      sources: Array.isArray(data.formats) ? data.formats.map((format: any) => ({
        name: format.format || "Video",
        url: format.url,
        type: format.mimeType || "video/mp4",
        quality: format.quality,
        size: format.contentLength,
        format: format.ext
      })) : [{
        name: "Video",
        url: data.url || data.downloadUrl,
        type: "video/mp4",
        quality: data.quality,
        format: "mp4"
      }]
    })

  } catch (error) {
    console.error("Error processing video URL:", error)
    return res.status(500).json({ 
      error: "Failed to process video URL. Please try a different URL or format." 
    })
  }
}

// Helper function to extract video ID from URL
function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // YouTube
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v")
    }
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1)
    }
    
    // Vimeo
    if (urlObj.hostname.includes("vimeo.com")) {
      return urlObj.pathname.split("/")[1]
    }
    
    return null
  } catch {
    return null
  }
}

// Helper function to parse YouTube duration format
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return 0

  const hours = (match[1] || "").replace("H", "")
  const minutes = (match[2] || "").replace("M", "")
  const seconds = (match[3] || "").replace("S", "")

  return (
    (parseInt(hours) || 0) * 3600 +
    (parseInt(minutes) || 0) * 60 +
    (parseInt(seconds) || 0)
  )
}
