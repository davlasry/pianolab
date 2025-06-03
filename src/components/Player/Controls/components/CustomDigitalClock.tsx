import { useCustomPlayerContext } from "@/components/Player/context/CustomPlayerContext";
import { TransportControls } from "@/components/Player/Controls/components/TransportControls";
import { TimeDisplay } from "@/components/Player/Controls/components/TimeDisplay";
import { useCustomTransportTime } from "@/CustomTransportTicker/customTransportTicker";

const CustomDigitalClock = () => {
    const { transportState, play, pause, stop, seek, isPlayerReady } =
        useCustomPlayerContext();

    // Use the transport ticker for more reactive time updates
    const currentTime = useCustomTransportTime();

    const isPlaying = transportState === "playing";

    // Handle transport control actions
    const togglePlayPause = () => {
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

    const rewind = () => {
        // Seek 5 seconds back
        const newTime = Math.max(0, currentTime - 5);
        seek(newTime);
    };

    const fastForward = () => {
        // Seek 5 seconds forward
        seek(currentTime + 5);
    };

    return (
        <div
            className={`flex-1 overflow-hidden border border-muted transition-all duration-300 ${isPlaying ? "shadow-primary/20" : ""}`}
        >
            <div className="p-2">
                <div className="flex flex-col items-center gap-6 md:flex-row">
                    <TimeDisplay time={currentTime} isPlaying={isPlaying} />
                    <div className="flex flex-1 flex-col gap-4">
                        <TransportControls
                            isPlaying={isPlaying}
                            onPlayPause={togglePlayPause}
                            onStop={handleStop}
                            onRewind={rewind}
                            onFastForward={fastForward}
                            isReady={isPlayerReady}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomDigitalClock;
