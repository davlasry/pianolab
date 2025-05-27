import React from "react";
import { Rewind, Play, Pause, Square, SkipForward } from "lucide-react";

interface TransportControlsProps {
    isPlaying: boolean;
    isReady: boolean;
    onPlayPause: () => void;
    onStop: () => void;
    onRewind: () => void;
    onFastForward: () => void;
}

const TransportControls: React.FC<TransportControlsProps> = ({
    isPlaying,
    onPlayPause,
    onStop,
    onRewind,
    onFastForward,
    isReady,
}) => {
    return (
        <div className="flex items-center justify-center gap-2 md:gap-4">
            <button
                onClick={onRewind}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80 md:p-3"
                aria-label="Rewind"
            >
                <Rewind size={20} />
            </button>

            <button
                onClick={onPlayPause}
                disabled={!isReady}
                className={`rounded-full p-4 transition-all duration-300 ${
                    isPlaying
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <Pause size={24} />
                ) : (
                    <Play size={24} className="ml-1" />
                )}
            </button>

            <button
                onClick={onStop}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80 md:p-3"
                aria-label="Stop"
            >
                <Square size={20} />
            </button>

            <button
                onClick={onFastForward}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80 md:p-3"
                aria-label="Fast Forward"
            >
                <SkipForward size={20} />
            </button>
        </div>
    );
};

export default TransportControls;
