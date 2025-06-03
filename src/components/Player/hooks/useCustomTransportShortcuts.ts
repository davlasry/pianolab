import { useShortcut } from "@/shortcuts/KeyboardShortcuts";
import { useCustomPlayerContext } from "@/components/Player/context/CustomPlayerContext";

export const useCustomTransportShortcuts = () => {
    const { seek, currentTime, isPlayerReady } = useCustomPlayerContext();
    const SEEK_DELTA = 5; // seconds

    // Arrow Right - seek forward
    useShortcut({
        key: "ArrowRight",
        description: "Seek forward 5 seconds",
        when: () => isPlayerReady,
        handler: () => {
            seek(currentTime + SEEK_DELTA);
        },
        stopPropagation: true,
    });

    // Arrow Left - seek backward
    useShortcut({
        key: "ArrowLeft",
        description: "Seek backward 5 seconds",
        when: () => isPlayerReady,
        handler: () => {
            seek(Math.max(0, currentTime - SEEK_DELTA));
        },
        stopPropagation: true,
    });

    // Home key - seek to beginning
    useShortcut({
        key: "Home",
        description: "Seek to beginning",
        when: () => isPlayerReady,
        handler: () => {
            seek(0);
        },
        stopPropagation: true,
    });
}; 