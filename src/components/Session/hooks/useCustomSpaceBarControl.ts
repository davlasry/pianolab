import { useEffect } from "react";
import { useCustomPlayerContext } from "@/components/Session/context/CustomPlayerContext";

export const useCustomSpaceBarControl = () => {
    const { isPlayerReady, transportState, play, pause } =
        useCustomPlayerContext();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.code === "Space" &&
                isPlayerReady &&
                !e.repeat &&
                !(
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLTextAreaElement ||
                    (e.target as HTMLElement).isContentEditable
                )
            ) {
                e.preventDefault();
                if (transportState === "playing") {
                    pause();
                } else {
                    play();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [transportState, isPlayerReady, play, pause]);
};
