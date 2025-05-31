import {
    useShowChordNotes,
    useKeyboardActions,
    useShowNoteDegrees,
} from "@/components/Player/Keyboard/stores/keyboardStore.ts";
import { KeyboardControls } from "src/components/Player/Controls/KeyboardControls.tsx";
import { TransportProvider } from "@/components/Player/Controls/context/TransportContext.tsx";
import { usePlayerContext } from "@/components/Player/context/PlayerContext.tsx";
import DigitalClock from "@/components/Player/Controls/components/DigitalClock.tsx";

function Controls({
    handleMoveToBeginning,
}: {
    handleMoveToBeginning: () => void;
}) {
    const {
        isPlaying,
        isPaused,
        play,
        stop,
        getTransport,
        resume,
        pause,
        isReady,
    } = usePlayerContext();

    // Use selector hooks instead of direct store access
    const showChordNotes = useShowChordNotes();
    const showNoteDegrees = useShowNoteDegrees();
    const { toggleShowChordNotes, toggleShowNoteDegrees } =
        useKeyboardActions();

    return (
        <TransportProvider
            isPlaying={isPlaying}
            isPaused={isPaused}
            getTransport={getTransport}
            play={() => play()}
            stop={stop}
            resume={resume}
            pause={pause}
            handleMoveToBeginning={handleMoveToBeginning}
            isReady={isReady}
        >
            <div className="flex flex-1 items-center gap-4 bg-muted">
                <DigitalClock />

                <KeyboardControls
                    showChordNotes={showChordNotes}
                    toggleShowChordNotes={toggleShowChordNotes}
                    showNoteDegrees={showNoteDegrees}
                    toggleShowNoteDegrees={toggleShowNoteDegrees}
                />
            </div>
        </TransportProvider>
    );
}

export default Controls;
