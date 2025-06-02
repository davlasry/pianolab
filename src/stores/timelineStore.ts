import { create } from "zustand";

interface TimelineState {
    isAutoScrollEnabled: boolean;
}

// Create a simple store without persist middleware for testing
const useTimelineStore = create<TimelineState & {
    toggleAutoScroll: () => void;
}>((set) => ({
    isAutoScrollEnabled: true, // enabled by default
    
    toggleAutoScroll: () => {
        set((state) => {
            console.log("Toggling from", state.isAutoScrollEnabled, "to", !state.isAutoScrollEnabled);
            return { isAutoScrollEnabled: !state.isAutoScrollEnabled };
        });
    },
}));

// Selector hooks
export const useAutoScrollEnabled = () =>
    useTimelineStore((state) => state.isAutoScrollEnabled);

// For simplicity, expose toggle function directly
export const useToggleAutoScroll = () =>
    useTimelineStore((state) => state.toggleAutoScroll);

// Export the store for direct access
export { useTimelineStore };
