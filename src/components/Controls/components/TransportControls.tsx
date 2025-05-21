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
                className="p-2 md:p-3 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-700 active:bg-zinc-600"
                aria-label="Rewind"
            >
                <Rewind size={20} />
            </button>

            <button
                onClick={onPlayPause}
                disabled={!isReady}
                className={`p-4 rounded-full transition-all duration-300 ${
                    isPlaying
                        ? "bg-orange-600 hover:bg-orange-500 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
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
                className="p-2 md:p-3 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-700 active:bg-zinc-600"
                aria-label="Stop"
            >
                <Square size={20} />
            </button>

            <button
                onClick={onFastForward}
                className="p-2 md:p-3 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-700 active:bg-zinc-600"
                aria-label="Fast Forward"
            >
                <SkipForward size={20} />
            </button>
        </div>
    );
};

export default TransportControls;
