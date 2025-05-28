import { useRef } from "react";
import { CurrentChord } from "@/components/Player/CurrentChord.tsx";
import { ChordEditor } from "@/components/Player/ChordEditor.tsx";
import { usePlayerContext } from "@/components/Player/context/PlayerContext";
import Controls from "@/components/Player/Controls/Controls.tsx";
import Timeline, {
    type TimelineHandle,
} from "@/components/Player/Timeline/Timeline.tsx";
import { useTransportShortcuts } from "@/components/Player/hooks/useTransportShortcuts.ts";

export const PlayerContent = () => {
    const timelineRef = useRef<TimelineHandle>(null);

    const {
        activeChord,
        // activeNotes,
        audioDuration,
        seek,
        seekToBeginning,
        transportState,
        getTransport,
        isReady,
    } = usePlayerContext();

    // Register ArrowLeft / ArrowRight keyboard shortcuts
    useTransportShortcuts({ seek, getTransport, isReady });

    const handleMoveToBeginning = () => {
        seekToBeginning();
        timelineRef.current?.scrollToBeginning();
    };

    return (
        <div
            className="flex flex-1 flex-col overflow-hidden"
            data-testid="player-content"
        >
            <div className="mb-6 flex flex-1 flex-col">
                <Timeline
                    duration={audioDuration}
                    onSeek={seek}
                    ref={timelineRef}
                    transportState={transportState}
                />
            </div>

            <div className="flex flex-col">
                {/*<Keyboard activeNotes={activeNotes} components={realistic} />*/}
                <ChordEditor />
                <div className="flex">
                    <Controls handleMoveToBeginning={handleMoveToBeginning} />
                    <CurrentChord chord={activeChord} />
                </div>
            </div>
        </div>
    );
};
