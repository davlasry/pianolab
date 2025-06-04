import { PlayerClock } from "@/components/Session/Controls/components/PlayerClock";
import { SharedPlaybackRateControl } from "@/components/Session/Controls/components/SharedPlaybackRateControl";

export interface SharedControlsProps {
    currentTime: number;
    isPlaying: boolean;
    isReady: boolean;
    playbackRate: number;
    onPlayPause: () => void;
    onStop: () => void;
    onRewind: () => void;
    onFastForward: () => void;
    onRateChange: (rate: number) => void;
}

/**
 * A shared controls component that can be used by both player implementations.
 * This component is UI-only and receives all its state and handlers as props.
 */
export function SharedControls({
    currentTime,
    isPlaying,
    isReady,
    playbackRate,
    onPlayPause,
    onStop,
    onRewind,
    onFastForward,
    onRateChange,
}: SharedControlsProps) {
    return (
        <div className="flex flex-1 items-center gap-4 bg-muted">
            <PlayerClock
                currentTime={currentTime}
                isPlaying={isPlaying}
                isReady={isReady}
                onPlayPause={onPlayPause}
                onStop={onStop}
                onRewind={onRewind}
                onFastForward={onFastForward}
            />

            <div className="flex items-center gap-2">
                <SharedPlaybackRateControl
                    currentRate={playbackRate}
                    onRateChange={onRateChange}
                />
            </div>
        </div>
    );
}
