import { useCustomPlayerContext } from "@/components/Player/context/CustomPlayerContext";
import { useCustomPlayerStore } from "@/stores/customPlayerStore";
import { useCustomTransportTime } from "@/CustomTransportTicker/customTransportTicker";
import { SharedControls } from "@/components/Player/Controls/SharedControls";

/**
 * CustomControls component that uses the shared UI components with CustomPlayer-specific logic
 */
function CustomControls() {
    const {
        transportState,
        play,
        pause,
        stop,
        seek,
        isPlayerReady,
        setPlaybackRate,
    } = useCustomPlayerContext();

    // Use the transport ticker for more reactive time updates
    const currentTime = useCustomTransportTime();

    // Get playback rate from store
    const { playbackRate, setPlaybackRate: storeSetPlaybackRate } =
        useCustomPlayerStore();

    // Map CustomPlayer states to the shared controls props
    const isPlaying = transportState === "playing";

    // Event handlers
    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const handleStop = () => {
        stop();
        seek(0); // Move to beginning when stopped
    };

    const handleRewind = () => {
        // Seek 5 seconds back
        const newTime = Math.max(0, currentTime - 5);
        seek(newTime);
    };

    const handleFastForward = () => {
        // Seek 5 seconds forward
        seek(currentTime + 5);
    };

    const handleRateChange = (rate: number) => {
        // Update both the store and the player
        storeSetPlaybackRate(rate);
        setPlaybackRate(rate);
    };

    return (
        <SharedControls
            currentTime={currentTime}
            isPlaying={isPlaying}
            isReady={isPlayerReady}
            playbackRate={playbackRate}
            onPlayPause={handlePlayPause}
            onStop={handleStop}
            onRewind={handleRewind}
            onFastForward={handleFastForward}
            onRateChange={handleRateChange}
        />
    );
}

export default CustomControls;
