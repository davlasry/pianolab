import { useEffect, useState, useRef } from "react";
import { Keyboard } from "src/Keyboard/components/Keyboard";
import { Clock } from "@/components/Toolbar/Clock.tsx";
import {
    Timeline,
    type TimelineHandle,
} from "@/components/Timeline/Timeline.tsx";
import { Toolbar } from "@/components/Toolbar/Toolbar.tsx";
import { CurrentChord } from "@/components/Toolbar/CurrentChord.tsx";
import { usePlayerContext } from "src/context/PlayerContext";
import { realistic } from "src/presets/realistic";

export const PlayerContent = () => {
    const [isReady, setReady] = useState(false);
    const timelineRef = useRef<TimelineHandle>(null);

    const {
        activeChord,
        activeNotes,
        play,
        pause,
        resume,
        stop,
        isPlaying,
        isPaused,
        isStopped,
        audioDuration,
        seek,
        seekToBeginning,
        loadAudio,
        loadMidi,
    } = usePlayerContext();

    useEffect(() => {
        let isMounted = true;

        const loadAssets = async () => {
            try {
                await Promise.all([loadMidi(), loadAudio()]);
                if (isMounted) {
                    setReady(true);
                }
            } catch (error) {
                console.error("Failed to load assets:", error);
            }
        };

        loadAssets();

        return () => {
            isMounted = false;
        };
    }, []); // Now we can safely include these dependencies

    const handleMoveToBeginning = () => {
        // Call the seekToBeginning function from the player context
        seekToBeginning();

        // Scroll the timeline to the beginning
        timelineRef.current?.scrollToBeginning();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <CurrentChord chord={activeChord} />

                <Toolbar
                    onPlay={() => play()}
                    onPause={pause}
                    onResume={resume}
                    onStop={stop}
                    onMoveToBeginning={handleMoveToBeginning}
                    isReady={isReady}
                    isPlaying={isPlaying}
                    isPaused={isPaused}
                    isStopped={isStopped}
                />
            </div>

            <Clock />

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
