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
                className="p-2 md:p-3 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted active:bg-muted/80"
                aria-label="Rewind"
            >
                <Rewind size={20} />
            </button>

            <button
                onClick={onPlayPause}
                disabled={!isReady}
                className={`p-4 rounded-full transition-all duration-300 ${
                    isPlaying
                        ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
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
                className="p-2 md:p-3 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted active:bg-muted/80"
                aria-label="Stop"
            >
                <Square size={20} />
            </button>

            <button
                onClick={onFastForward}
                className="p-2 md:p-3 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted active:bg-muted/80"
                aria-label="Fast Forward"
            >
                <SkipForward size={20} />
            </button>
        </div>
    );
};

export default TransportControls;
