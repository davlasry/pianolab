import { create } from "zustand";

// Type for the store state
interface CustomPlayerState {
    // State
    playbackRate: number;

    // Actions
    setPlaybackRate: (rate: number) => void;
}

/**
 * Zustand store for the custom player
 * This centralizes player state that needs to be accessed across components
 */
export const useCustomPlayerStore = create<CustomPlayerState>((set) => ({
    // Initial state
    playbackRate: 1,

    // Actions
    setPlaybackRate: (rate: number) => {
        // Clamp the rate between 0.25 and 2.0
        const clampedRate = Math.max(0.25, Math.min(2.0, rate));
        set({ playbackRate: clampedRate });
    },
}));
