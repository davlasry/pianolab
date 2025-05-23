import { useRef } from "react";
import { Keyboard } from "@/components/Player/Keyboard/components/Keyboard";
import {
    Timeline,
    type TimelineHandle,
} from "@/components/Player/Timeline/Timeline.tsx";
import { CurrentChord } from "@/components/Player/CurrentChord.tsx";
import { usePlayerContext } from "@/components/Player/context/PlayerContext";

import Controls from "@/components/Player/Controls/Controls.tsx";
import { realistic } from "@/components/Player/Keyboard/presets";

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
            <div className="flex items-center mb-4 gap-2">
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
