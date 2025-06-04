import { useShortcut } from "@/shortcuts/KeyboardShortcuts.tsx";
import type { TransportClass } from "tone/build/esm/core/clock/Transport";

export const useTransportShortcuts = ({
    seek,
    getTransport,
    isReady,
    play,
    pause,
    resume,
    isPlaying,
    isPaused
}: {
    seek: (time: number) => void;
    getTransport: () => TransportClass;
    isReady: boolean;
    play: () => void;
    pause: () => void;
    resume: () => void;
    isPlaying: boolean;
    isPaused: boolean;
}) => {
    const SEEK_DELTA = 0.5; // seconds

    useShortcut({
        key: "ArrowRight",
        description: "Seek forward 5 seconds",
        when: () => isReady,
        handler: () => {
            const current = getTransport().seconds;
            seek(current + SEEK_DELTA);
        },
        stopPropagation: true,
    });

    useShortcut({
        key: "ArrowLeft",
        description: "Seek backward 5 seconds",
        when: () => isReady,
        handler: () => {
            const current = getTransport().seconds;
            seek(Math.max(0, current - SEEK_DELTA));
        },
        stopPropagation: true,
    });
    
    useShortcut({
        key: " ", // Space key
        description: "Play/Pause",
        when: () => isReady,
        handler: () => {
            if (isPlaying) {
                pause();
            } else {
                if (isPaused) {
                    resume();
                } else {
                    play();
                }
            }
        },
        stopPropagation: true,
    });
};
