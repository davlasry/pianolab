import { Play, Pause, Square, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export interface TransportControlsProps {
    isPlaying: boolean;
    isReady: boolean;
    onPlayPause: () => void;
    onStop: () => void;
    onReset?: () => void;
    className?: string;
    onRewind?: () => void;
    onFastForward?: () => void;
}

export function TransportControls({
    isPlaying,
    isReady,
    onPlayPause,
    onStop,
    onRewind,
    onFastForward,
    className,
}: TransportControlsProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center space-x-2 sm:space-x-4",
                className,
            )}
        >
            <button
                onClick={onRewind}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/50 transition-colors duration-200 hover:bg-zinc-800"
                aria-label="Reset to Beginning"
            >
                <SkipBack className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-200" />
            </button>

            <button
                onClick={onPlayPause}
                className={cn(
                    "group relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200",
                    isPlaying
                        ? "bg-zinc-700/80 ring-2 ring-zinc-500 hover:bg-zinc-700"
                        : "bg-zinc-800/50 hover:bg-zinc-700/80",
                )}
                disabled={!isReady}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <Pause className="h-5 w-5 text-white transition-colors" />
                ) : (
                    <Play className="ml-0.5 h-5 w-5 text-zinc-300 transition-colors group-hover:text-white" />
                )}
                <div
                    className={cn(
                        "absolute inset-0 rounded-full border transition-all duration-300",
                        isPlaying
                            ? "border-zinc-500 group-hover:border-zinc-400"
                            : "border-zinc-700 group-hover:border-zinc-600",
                    )}
                />
            </button>

            <button
                onClick={onStop}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/50 transition-colors duration-200 hover:bg-zinc-800"
                aria-label="Stop"
            >
                <Square className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-200" />
            </button>

            <button
                onClick={onFastForward}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/50 transition-colors duration-200 hover:bg-zinc-800"
                aria-label="Skip Forward"
            >
                <SkipForward className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-200" />
            </button>
        </div>
    );
}
