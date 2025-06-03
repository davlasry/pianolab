/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - Standard: https://www.youtube.com/watch?v=VIDEO_ID
 * - Short: https://youtu.be/VIDEO_ID
 * - Embed: https://www.youtube.com/embed/VIDEO_ID
 * - With timestamp or other parameters
 */
export function extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    
    // Try to match standard YouTube URL
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    
    if (match && match[1]) {
        return match[1];
    }
    
    return null;
}

/**
 * Validate if a string is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
    return !!extractYouTubeVideoId(url);
}

/**
 * Convert seconds to HH:MM:SS format for YouTube player
 */
export function formatTimeForYouTube(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let result = '';
    
    if (hrs > 0) {
        result += `${hrs}:${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    } else {
        result += `${mins}:${secs < 10 ? '0' + secs : secs}`;
    }
    
    return result;
}

/**
 * Create a YouTube embed URL from a video ID
 */
export function createYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
} 