import { useRef, useEffect } from "react";
import { ChordEditor } from "@/components/Player/ChordEditor.tsx";
import { usePlayerContext } from "@/components/Player/context/PlayerContext";
import {
    useRestoredPosition,
    usePlayheadActions,
} from "@/stores/playheadStore.ts";
import Controls from "@/components/Player/Controls/Controls.tsx";
import Timeline, {
    type TimelineHandle,
} from "@/components/Player/Timeline/Timeline.tsx";
import { useTransportShortcuts } from "@/components/Player/hooks/useTransportShortcuts.ts";
import { useChordShortcuts } from "@/components/Player/hooks/useChordShortcuts";
import { Keyboard } from "@/components/Player/Keyboard/components/Keyboard.tsx";
import { customKeyboard } from "@/components/Player/Keyboard/components/CustomKeyboard.tsx";
import { KeyboardToolbar } from "@/components/Player/Keyboard/components/KeyboardToolbar.tsx";

export const PlayerContent = () => {
    const timelineRef = useRef<TimelineHandle>(null);

    const {
        activeChord,
        activeNotes,
        audioDuration,
        seek,
        seekToBeginning,
        transportState,
        getTransport,
        isReady,
    } = usePlayerContext();

    // Register keyboard shortcuts
    useTransportShortcuts({ seek, getTransport, isReady });
    useChordShortcuts();

    // Get the restored position and action to clear it from Zustand store
    const restoredPosition = useRestoredPosition();
    const { setRestoredPosition } = usePlayheadActions();

    // React to changes in the restored position
    useEffect(() => {
        if (
            restoredPosition !== null &&
            timelineRef.current &&
            audioDuration > 0
        ) {
            // Only center if we have a valid audio duration and the time is within range
            if (restoredPosition > 0 && restoredPosition < audioDuration) {
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
    }, [restoredPosition, audioDuration, setRestoredPosition]);

    return (
        <div
            className="flex w-full flex-1 flex-col overflow-hidden"
            data-testid="player-content"
        >
            <div className="flex flex-1 flex-col">
                <Timeline
                    duration={audioDuration}
                    onSeek={seek}
                    ref={timelineRef}
                    transportState={transportState}
                />

                {/* ChordEditor is now always visible and positioned right below the Timeline */}
                <ChordEditor />
            </div>

            <div className="relative flex flex-col">
                {/* Keyboard Toolbar */}
                <KeyboardToolbar activeChord={activeChord} />

                <div className="">
                    <Keyboard
                        activeNotes={activeNotes}
                        activeChord={activeChord}
                        components={customKeyboard}
                        height={180}
                        // keyRange={[40, 81]}
                    />
                </div>

                <div className="flex">
                    <Controls />
                </div>
            </div>
        </div>
    );
};
