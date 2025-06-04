import { useRef, useEffect } from "react";
import { useCustomPlayerContext } from "@/components/Session/context/CustomPlayerContext";
import {
    usePlayheadActions,
    useRestoredPosition,
} from "@/stores/playheadStore";
import CustomControls from "@/components/Session/Controls/CustomControls";
import { Keyboard } from "@/components/Session/Keyboard/components/Keyboard";
import { customKeyboard } from "@/components/Session/Keyboard/components/CustomKeyboard";
import { KeyboardToolbar } from "@/components/Session/Keyboard/components/KeyboardToolbar";
import { CustomChordEditor } from "@/components/Session/ChordEditor/CustomChordEditor.tsx";
import { useCustomTransportShortcuts } from "@/components/Session/hooks/useCustomTransportShortcuts";
import { useCustomChordShortcuts } from "@/components/Session/hooks/useCustomChordShortcuts";
import { useCustomSpaceBarControl } from "@/components/Session/hooks/useCustomSpaceBarControl";
import type { TimelineHandle } from "@/components/Session/Timeline/Shared/SharedTimeline.tsx";
import CustomTimeline from "@/components/Session/Timeline/CustomTimeline/CustomTimeline.tsx";

export const CustomPlayerContent = () => {
    const timelineRef = useRef<TimelineHandle>(null);

    const {
        activeChord,
        activeNotes,
        duration,
        currentTime,
        transportState,
        seek,
        // isPlayerReady,
    } = useCustomPlayerContext();

    // Set up all keyboard shortcuts
    useCustomTransportShortcuts();
    useCustomChordShortcuts();
    useCustomSpaceBarControl();

    // Get the restored position and action to clear it from Zustand store
    const restoredPosition = useRestoredPosition();
    const { setRestoredPosition } = usePlayheadActions();

    // React to changes in the restored position
    useEffect(() => {
        if (restoredPosition !== null && timelineRef.current && duration > 0) {
            // Only center if we have a valid audio duration and the time is within range
            if (restoredPosition > 0 && restoredPosition < duration) {
                // Add a small delay to ensure the timeline is fully rendered
                setTimeout(() => {
                    timelineRef.current?.scrollToTime(restoredPosition, true);

                    // Clear the restored position after handling it
                    setRestoredPosition(null);
                }, 200);
            } else {
                // Invalid position, just clear it
                setRestoredPosition(null);
            }
        }
    }, [restoredPosition, duration, setRestoredPosition]);

    // Convert MidiNote[] from CustomPlayer to the format expected by Keyboard
    const formattedActiveNotes = activeNotes.map((note) => ({
        midi: note.midi,
        hand: (note.hand === "L" ? "left" : "right") as "left" | "right",
    }));

    return (
        <div
            className="flex w-full flex-1 flex-col overflow-hidden"
            data-testid="custom-player-content"
        >
            <div className="flex flex-1 flex-col">
                <CustomTimeline
                    duration={duration}
                    onSeek={seek}
                    ref={timelineRef}
                    transportState={transportState}
                    currentTime={currentTime}
                />

                {/* Custom Chord Editor */}
                <CustomChordEditor />
            </div>

            <div className="relative flex flex-col">
                {/* Keyboard Toolbar */}
                <KeyboardToolbar activeChord={activeChord} />

                <div className="">
                    <Keyboard
                        activeNotes={formattedActiveNotes}
                        activeChord={activeChord}
                        components={customKeyboard}
                        height={180}
                    />
                </div>

                <div className="flex">
                    <CustomControls />
                </div>
            </div>
        </div>
    );
};
