import React from "react";

const useSpaceBarControl = ({
    isReady,
    isPlaying,
    isPaused,
    onPlay,
    onPause,
    onResume,
}: {
    isReady: boolean;
    isPlaying: boolean;
    isPaused: boolean;
    onPlay: () => void;
    onPause: () => void;
    onResume: () => void;
}) => {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.code === "Space" &&
                isReady &&
                !e.repeat &&
                !(
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLTextAreaElement
                )
            ) {
                e.preventDefault();
                if (isPlaying) {
                    onPause();
                } else if (isPaused) {
                    onResume();
                } else {
                    onPlay();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isPlaying, isPaused, isReady, onPlay, onPause, onResume]);
};

export const Toolbar = ({
    onPlay,
    onPause,
    onResume,
    onStop,
    isReady,
    isPlaying,
    isPaused,
}: {
    onPlay: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    isReady: boolean;
    isPlaying: boolean;
    isPaused: boolean;
}) => {
    useSpaceBarControl({
        isReady,
        isPlaying,
        isPaused,
        onPlay,
        onPause,
        onResume,
    });

    return (
        <div className="flex gap-4">
            {!isPlaying ? (
                <button
                    onClick={isPaused ? onResume : onPlay}
                    disabled={!isReady}
                    aria-label={isPaused ? "Resume" : "Play"}
                    className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-400 cursor-pointer disabled:opacity-50"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            ) : (
                <button
                    onClick={onPause}
                    disabled={!isReady}
                    aria-label="Pause"
                    className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-400 cursor-pointer disabled:opacity-50"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                </button>
            )}
            <button
                onClick={onStop}
                disabled={!isReady}
                aria-label="Stop"
                className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-400 cursor-pointer disabled:opacity-50"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6 6h12v12H6z" />
                </svg>
            </button>
        </div>
    );
};
