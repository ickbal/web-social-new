export function isValidVideoUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.toLowerCase();
    const hostname = parsedUrl.hostname.toLowerCase();

    // Direct video file extensions
    const videoExtensions = [
      '.mp4', '.m3u8', '.webm', '.mov', '.mkv', '.avi', '.flv', '.wmv', '.mpg', '.mpeg',
      '.3gp', '.3g2', '.m4v', '.f4v', '.f4p', '.f4a', '.f4b'
    ];

    // Video hosting domains
    const videoDomains = [
      'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'dai.ly',
      'twitch.tv', 'streamable.com', 'giphy.com', 'imgur.com', 'gfycat.com',
      'reddit.com', 'redgifs.com', 'pornhub.com', 'xvideos.com', 'xhamster.com',
      'onlyfans.com', 'fansly.com', 'patreon.com', 'vimeo.com', 'dailymotion.com'
    ];

    // Check for direct video files
    if (videoExtensions.some(ext => path.endsWith(ext))) {
      return true;
    }

    // Check for video hosting domains
    if (videoDomains.some(domain => hostname.includes(domain))) {
      return true;
    }

    // Check for common video CDN patterns
    const cdnPatterns = [
      /\.(cloudfront|akamai|fastly|cloudflare)\.net$/,
      /\.(s3|amazonaws)\.com$/,
      /\.(cdn|media)\./,
      /\.(video|stream)\./
    ];

    if (cdnPatterns.some(pattern => pattern.test(hostname))) {
      return true;
    }

    // Check for HLS/DASH manifest files
    if (path.endsWith('.m3u8') || path.endsWith('.mpd')) {
      return true;
    }

    // Check for common video API endpoints
    const apiPatterns = [
      /\/video\//,
      /\/stream\//,
      /\/media\//,
      /\/content\//,
      /\/play\//
    ];

    if (apiPatterns.some(pattern => pattern.test(path))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
} 