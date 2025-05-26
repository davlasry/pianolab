// transportTicker.ts
import { useSyncExternalStore } from "react";

/** Mutable source of truth */
let time = 0;
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

export const transportTicker = {
    /** read fn for useSyncExternalStore */
    getSnapshot: () => time,
    /** subscribe fn for useSyncExternalStore */
    subscribe: (cb: () => void) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
    },
    /** push updates (called from the loop below) */
    set: (t: number) => {
        time = t;
        emit();
    },
};

export function quantisedSnapshot(fps = 30) {
    const step = 1 / fps; // e.g. 33 ms steps
    const t = transportTicker.getSnapshot(); // raw seconds
    return Math.floor(t / step) * step; // round *down* to step
}

/** Convenience hook */
export function useTransportTime(fps = 30) {
    return useSyncExternalStore(
        transportTicker.subscribe,
        () => quantisedSnapshot(fps), // client
        () => 0, // server
    );
}

export function useProgressPercent(duration: number, fps = 30) {
    return useSyncExternalStore(
        transportTicker.subscribe,
        () => {
            const pct = quantisedSnapshot(fps) / duration;
            return pct > 1 ? 1 : pct;
        },
        () => 0,
    );
}
