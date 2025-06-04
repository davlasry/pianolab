import { usePlayerContext } from "@/components/Session/context/PlayerContext";
import {
    usePlaybackRate,
    usePlaybackRateActions,
} from "@/stores/playbackRateStore";
import { useTransportTime } from "@/TransportTicker/transportTicker";
import { SharedControls } from "@/components/Session/Controls/SharedControls";
import { SlimTimeline } from "@/components/Session/Controls/SlimTimeline";

/**
 * Controls component that uses the shared UI components with regular Player-specific logic
 */
function Controls() {
    const {
        isPlaying,
        isPaused,
        play,
        stop,
        getTransport,
        resume,
        pause,
        isReady,
        seekToBeginning,
        seek,
        audioDuration,
    } = usePlayerContext();

    // Use the transport ticker for reactive time updates
    const currentTime = useTransportTime();

    // Get playback rate from store
    const rate = usePlaybackRate();
    const { setRate } = usePlaybackRateActions();

    // Event handlers
    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            if (isPaused) {
                resume();
            } else {
                play();
            }
        }
    };

    const handleStop = () => {
        stop();
        seekToBeginning();
    };

    const handleRewind = () => {
        // Seek 5 seconds back
        const transport = getTransport();
        const newTime = Math.max(0, transport.seconds - 5);
        seek(newTime);
    };

    const handleFastForward = () => {
        // Seek 5 seconds forward
        const transport = getTransport();
        seek(transport.seconds + 5);
    };

    return (
        <div className="flex w-full flex-col">
            <SlimTimeline
                duration={audioDuration}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onSeek={seek}
                className="mb-1"
            />
            <SharedControls
                currentTime={currentTime}
                isPlaying={isPlaying}
                isReady={isReady}
                playbackRate={rate}
                onPlayPause={handlePlayPause}
                onStop={handleStop}
                onRewind={handleRewind}
                onFastForward={handleFastForward}
                onRateChange={setRate}
            />
        </div>
    );
}

export default Controls;
