import { useState, useEffect } from 'react';

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

export type YouTubeAPIStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useYouTubeAPI(): {
    status: YouTubeAPIStatus;
    error: Error | null;
} {
    const [status, setStatus] = useState<YouTubeAPIStatus>('idle');
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Check if the API script is already loaded
        if (window.YT && window.YT.Player) {
            setStatus('ready');
            return;
        }

        if (document.getElementById('youtube-iframe-api')) {
            // Script tag already exists, still loading
            setStatus('loading');
            return;
        }

        setStatus('loading');

        // Create script element for YouTube API
        const script = document.createElement('script');
        script.id = 'youtube-iframe-api';
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;

        // Handle script load error
        script.onerror = (e) => {
            setStatus('error');
            setError(new Error('Failed to load YouTube IFrame API'));
            console.error('YouTube IFrame API loading failed:', e);
        };

        // Set up the callback function that YouTube API will call when ready
        window.onYouTubeIframeAPIReady = () => {
            setStatus('ready');
        };

        // Add script to the document
        document.head.appendChild(script);

        // Cleanup function
        return () => {
            // We don't actually remove the script, as other components might be using it
            // But we can clean up our callback
            if (window.onYouTubeIframeAPIReady === setStatus) {
                window.onYouTubeIframeAPIReady = () => {};
            }
        };
    }, []);

    return { status, error };
} 