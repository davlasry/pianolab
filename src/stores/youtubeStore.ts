import { create } from "zustand";

/*───────────────────────────────────────────────────────────────
  YouTube Store Types
───────────────────────────────────────────────────────────────*/
interface YouTubeState {
    url: string | null;
    videoId: string | null;
    player: any | null; // YouTube Player instance
    isReady: boolean;
    isVisible: boolean;
    actions: {
        setUrl: (url: string | null) => void;
        setVideoId: (id: string | null) => void;
        setPlayer: (player: any | null) => void;
        setIsReady: (isReady: boolean) => void;
        toggleVisibility: () => void;
        setIsVisible: (isVisible: boolean) => void;
    };
}

/*───────────────────────────────────────────────────────────────
  YouTube Store Implementation
───────────────────────────────────────────────────────────────*/
export const useYouTubeStore = create<YouTubeState>((set) => ({
    // Initial state
    url: null,
    videoId: null,
    player: null,
    isReady: false,
    isVisible: false,

    // Actions
    actions: {
        setUrl: (url: string | null) => set({ url }),
        setVideoId: (videoId: string | null) => set({ videoId }),
        setPlayer: (player: any | null) => set({ player }),
        setIsReady: (isReady: boolean) => set({ isReady }),
        toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
        setIsVisible: (isVisible: boolean) => set({ isVisible }),
    },
}));

/*───────────────────────────────────────────────────────────────
  Selector Hooks
───────────────────────────────────────────────────────────────*/
export const useYouTubeUrl = () => useYouTubeStore((state) => state.url);
export const useYouTubeVideoId = () => useYouTubeStore((state) => state.videoId);
export const useYouTubePlayer = () => useYouTubeStore((state) => state.player);
export const useYouTubeIsReady = () => useYouTubeStore((state) => state.isReady);
export const useYouTubeIsVisible = () => useYouTubeStore((state) => state.isVisible);

/*───────────────────────────────────────────────────────────────
  Actions Hook
───────────────────────────────────────────────────────────────*/
export const useYouTubeActions = () => useYouTubeStore((state) => state.actions); 