export interface MediaSource {
  name: string;
  url: string;
  type: string;
  quality?: string;
  size?: string;
  format?: string;
}

export interface MediaInfo {
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  sources: MediaSource[];
}

export const extractMediaInfo = async (url: string): Promise<MediaInfo> => {
  try {
    const response = await fetch("/api/source", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("Failed to extract media info");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error extracting media info:", error);
    throw error;
  }
};

export const getBestQualitySource = (sources: MediaSource[]): MediaSource => {
  return sources.reduce((best, current) => {
    if (!best) return current;
    if (!current) return best;
    
    // Prefer MP4 format
    if (current.format === "mp4" && best.format !== "mp4") return current;
    if (best.format === "mp4" && current.format !== "mp4") return best;
    
    // Prefer higher quality
    if (current.quality && best.quality) {
      const currentQuality = parseInt(current.quality);
      const bestQuality = parseInt(best.quality);
      if (!isNaN(currentQuality) && !isNaN(bestQuality)) {
        return currentQuality > bestQuality ? current : best;
      }
    }
    
    return best;
  });
}; 