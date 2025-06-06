import { TransportControls } from "@/components/Session/Controls/components/TransportControls";
import { TimeDisplay } from "@/components/Session/Controls/components/TimeDisplay";

export interface PlayerClockProps {
    currentTime: number;
    isPlaying: boolean;
    isReady: boolean;
    onPlayPause: () => void;
    onStop: () => void;
    onRewind: () => void;
    onFastForward: () => void;
}

/**
 * A shared clock component that can be used by both player implementations.
 * This component is UI-only and receives all its state and handlers as props.
 */
export function PlayerClock({
    currentTime,
    isPlaying,
    isReady,
    onPlayPause,
    onStop,
    onRewind,
    onFastForward,
}: PlayerClockProps) {
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
                            onPlayPause={onPlayPause}
                            onStop={onStop}
                            onRewind={onRewind}
                            onFastForward={onFastForward}
                            isReady={isReady}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
