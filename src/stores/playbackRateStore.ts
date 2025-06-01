import { create } from "zustand";
import * as Tone from "tone";

/*───────────────────────────────────────────────────────────────
  Playback Rate Store Types
───────────────────────────────────────────────────────────────*/
interface PlaybackRateState {
    rate: number;
    actions: {
        setRate: (rate: number) => void;
    };
}

/*───────────────────────────────────────────────────────────────
  Playback Rate Store Implementation
───────────────────────────────────────────────────────────────*/
export const usePlaybackRateStore = create<PlaybackRateState>((set) => ({
    // Initial state - normal speed
    rate: 1,

    // Actions
    actions: {
        setRate: (rate: number) => {
            // Get the transport
            const transport = Tone.getTransport();
            
            // The key to making this work is:
            // 1. Save the original BPM if we haven't already
            if (!window._originalBPM && transport.bpm) {
                window._originalBPM = transport.bpm.value;
                console.log(`Stored original BPM: ${window._originalBPM}`);
            }
            
            // 2. Set the BPM based on the rate
            if (window._originalBPM && transport.bpm) {
                const newBpm = window._originalBPM * rate;
                console.log(`Setting new BPM: ${newBpm} (${window._originalBPM} × ${rate})`);
                transport.bpm.value = newBpm;
            }
            
            // 3. To make MIDI events play at the correct rate, we need to:
            //    a) Cancel any existing events
            //    b) Let the player hook rebuild the parts
            if (transport.state === "started") {
                // Only try to cancel events if the transport is actually running
                console.log("Canceling scheduled events and letting parts rebuild");
                transport.cancel();
            }
            
            // Update the state
            set({ rate });
        },
    },
}));

// Add the missing property to the Window interface
declare global {
    interface Window {
        _originalBPM?: number;
    }
}

/*───────────────────────────────────────────────────────────────
  Selector Hooks
───────────────────────────────────────────────────────────────*/
export const usePlaybackRate = () =>
    usePlaybackRateStore((state) => state.rate);

/*───────────────────────────────────────────────────────────────
  Actions Hook
───────────────────────────────────────────────────────────────*/
export const usePlaybackRateActions = () =>
    usePlaybackRateStore((state) => state.actions);
