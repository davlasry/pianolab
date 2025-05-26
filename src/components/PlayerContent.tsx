import { useRef } from "react";
import { CurrentChord } from "@/components/Player/CurrentChord.tsx";
import { usePlayerContext } from "@/components/Player/context/PlayerContext";
import Controls from "@/components/Player/Controls/Controls.tsx";
import Timeline, {
    type TimelineHandle,
} from "@/components/Player/Timeline/Timeline.tsx";

export const PlayerContent = () => {
    const timelineRef = useRef<TimelineHandle>(null);

    const {
        activeChord,
        // activeNotes,
        audioDuration,
        seek,
        seekToBeginning,
        transportState,
    } = usePlayerContext();

    const handleMoveToBeginning = () => {
        seekToBeginning();
        timelineRef.current?.scrollToBeginning();
    };

    return (
        <div
            className="flex flex-col flex-1 overflow-hidden"
            data-testid="player-content"
        >
            <div className="flex flex-col flex-1 mb-6">
                <Timeline
                    duration={audioDuration}
                    onSeek={seek}
                    ref={timelineRef}
                    transportState={transportState}
                />
            </div>

            <div className="flex flex-col">
                {/*<Keyboard activeNotes={activeNotes} components={realistic} />*/}
                <div className="flex">
                    <Controls handleMoveToBeginning={handleMoveToBeginning} />
                    <CurrentChord chord={activeChord} />
                </div>
            </div>
        </div>
    );
};
