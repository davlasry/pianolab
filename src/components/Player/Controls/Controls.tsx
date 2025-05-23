import DigitalClock from "@/components/Player/Controls/components/DigitalClock.tsx";
import { TransportProvider } from "@/components/Player/Controls/context/TransportContext.tsx";
import { usePlayerContext } from "@/components/Player/context/PlayerContext.tsx";

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
