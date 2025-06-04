import { useState, useEffect, useCallback } from "react";
import * as Tone from "tone";

export type TransportState = "started" | "paused" | "stopped";

export function useTransportState() {
    const transport = Tone.getTransport();
    const [transportState, setTransportState] = useState<TransportState>(
        transport.state as TransportState,
    );

    // Stable callback to update whenever the transport emits an event
    const updateState = useCallback(() => {
        setTransportState(transport.state as TransportState);
    }, [transport]);

    useEffect(() => {
        const events = ["start", "stop", "pause"] as const;

        events.forEach((evt) => transport.on(evt, updateState));

        // Run it once to pick up the current state immediately
        updateState();

        return () => {
            // Unsubscribe on cleanup
            events.forEach((evt) => transport.off(evt, updateState));
        };
    }, [transport, updateState]);

    return { transportState };
}
