import { useEffect } from "react";

export const useSpaceBarControl = ({
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
    useEffect(() => {
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
