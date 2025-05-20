import { useEffect, useState } from "react";
import { Keyboard } from "src/Keyboard/components/Keyboard";
import { Clock } from "src/components/Clock";
import { Timeline } from "src/components/Timeline";
import { Toolbar } from "src/components/Toolbar";
import { CurrentChord } from "src/components/CurrentChord";
import { usePlayerContext } from "src/context/PlayerContext";
import { realistic } from "src/presets/realistic";

export const PlayerContent = () => {
    const [isReady, setReady] = useState(false);
    const {
        activeChord,
        activeNotes,
        play,
        pause,
        resume,
        stop,
        isPlaying,
        isPaused,
        audioDuration,
        seek,
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
    }, [loadMidi, loadAudio]); // Now we can safely include these dependencies

    return (
        <>
            <CurrentChord chord={activeChord} />

            <Toolbar
                onPlay={() => play()}
                onPause={pause}
                onResume={resume}
                onStop={stop}
                isReady={isReady}
                isPlaying={isPlaying}
                isPaused={isPaused}
            />

            <Clock />

            <Timeline duration={audioDuration} onSeek={seek} />

            <Keyboard activeNotes={activeNotes} components={realistic} />
        </>
    );
};
