import { useSyncExternalStore } from "react";

// Constants for localStorage
const CUSTOM_PLAYHEAD_POSITION_KEY = "pianolab_custom_playhead_position";

/** Mutable source of truth - initialize from localStorage if available */
let time = 0;

// Try to restore time from localStorage on initial load
try {
    const savedTime = localStorage.getItem(CUSTOM_PLAYHEAD_POSITION_KEY);
    if (savedTime) {
        const parsedTime = parseFloat(savedTime);
        if (!isNaN(parsedTime) && parsedTime > 0) {
            time = parsedTime;
        }
    }
} catch (error) {
    console.error("Error reading from localStorage:", error);
}

const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

export const customTransportTicker = {
    /** read fn for useSyncExternalStore */
    getSnapshot: () => time,
    /** subscribe fn for useSyncExternalStore */
    subscribe: (cb: () => void) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
    },
    /** push updates (called from the loop) */
    set: (t: number) => {
        time = t;
        // Save to localStorage if it's a valid time
        if (!isNaN(t) && t > 0) {
            try {
                localStorage.setItem(CUSTOM_PLAYHEAD_POSITION_KEY, t.toString());
            } catch (error) {
                console.error("Error writing to localStorage:", error);
            }
        }
        emit();
    },
};

export function quantisedSnapshot(fps = 30) {
    const step = 1 / fps; // e.g. 33 ms steps
    const t = customTransportTicker.getSnapshot(); // raw seconds
    return Math.floor(t / step) * step; // round *down* to step
}

/** Convenience hook */
export function useCustomTransportTime(fps = 30) {
    return useSyncExternalStore(
        customTransportTicker.subscribe,
        () => quantisedSnapshot(fps), // client
        () => 0, // server
    );
}

export function useCustomProgressPercent(duration: number, fps = 30) {
    return useSyncExternalStore(
        customTransportTicker.subscribe,
        () => {
            const pct = quantisedSnapshot(fps) / duration;
            return pct > 1 ? 1 : pct;
        },
        () => 0,
    );
} 