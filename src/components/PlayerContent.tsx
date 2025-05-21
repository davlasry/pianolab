import { useRef } from "react";
import { Keyboard } from "src/Keyboard/components/Keyboard";
import {
    Timeline,
    type TimelineHandle,
} from "@/components/Timeline/Timeline.tsx";
import { CurrentChord } from "@/components/Toolbar/CurrentChord.tsx";
import { usePlayerContext } from "src/context/PlayerContext";
import { realistic } from "src/presets/realistic";
import Controls from "@/components/Controls/Controls.tsx";

export const PlayerContent = () => {
    const timelineRef = useRef<TimelineHandle>(null);

    const { activeChord, activeNotes, audioDuration, seek, seekToBeginning } =
        usePlayerContext();

    const handleMoveToBeginning = () => {
        // Call the seekToBeginning function from the player context
        seekToBeginning();
        // Scroll the timeline to the beginning
        timelineRef.current?.scrollToBeginning();
    };

    return (
        <>
            <div className="flex items-center mb-4">
                <Controls handleMoveToBeginning={handleMoveToBeginning} />
                <CurrentChord chord={activeChord} />
            </div>

            <div className="mb-6">
                <Timeline
                    duration={audioDuration}
                    onSeek={seek}
                    ref={timelineRef}
                />
            </div>

            <Keyboard activeNotes={activeNotes} components={realistic} />
        </>
    );
};
