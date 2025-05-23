import DigitalClock from "src/components/SessionView/Controls/components/DigitalClock.tsx";
import { TransportProvider } from "src/components/SessionView/Controls/context/TransportContext.tsx";
import { usePlayerContext } from "@/components/SessionView/context/PlayerContext.tsx";

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
            <DigitalClock />
        </TransportProvider>
    );
}

export default Controls;
