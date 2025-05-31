import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimelineState {
    isAutoScrollEnabled: boolean;
    actions: {
        toggleAutoScroll: () => void;
    };
}

export const useTimelineStore = create<TimelineState>()(
    persist(
        (set) => ({
            isAutoScrollEnabled: true, // enabled by default
            actions: {
                toggleAutoScroll: () =>
                    set((state) => ({
                        isAutoScrollEnabled: !state.isAutoScrollEnabled,
                    })),
            },
        }),
        {
            name: "timeline-settings",
        },
    ),
);

// Selector hooks
export const useAutoScrollEnabled = () =>
    useTimelineStore((state) => state.isAutoScrollEnabled);
export const useTimelineActions = () =>
    useTimelineStore((state) => state.actions); 