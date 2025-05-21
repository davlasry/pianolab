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

export const PlayerControls = ({
    onPlay,
    onPause,
    onResume,
    onStop,
    onMoveToBeginning,
    isReady,
    isPlaying,
    isPaused,
    isStopped,
}: {
    onPlay: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onMoveToBeginning: () => void;
    isReady: boolean;
    isPlaying: boolean;
    isPaused: boolean;
    isStopped: boolean;
}) => {
    const handlePlay = () => {
        if (isPaused) {
            onResume();
        } else {
            onPlay();
        }
    };

    useSpaceBarControl({
        isReady,
        isPlaying,
        isPaused,
        onPlay: handlePlay,
        onPause,
        onResume,
    });

    return (
        <div className="flex gap-4">
            {!isPlaying ? (
                <button
                    onClick={handlePlay}
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
            {isStopped ? (
                <button
                    onClick={onMoveToBeginning}
                    disabled={!isReady}
                    aria-label="Move to Beginning"
                    className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-400 cursor-pointer disabled:opacity-50"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        fill="currentColor"
                    >
                        <path d="M 79,98 79,2 20,50 z M 20,2 20,98 10,98 10,2 z" />
                    </svg>
                </button>
            ) : (
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
            )}
        </div>
    );
};
