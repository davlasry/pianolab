import DigitalClock from "./components/DigitalClock";
import { TransportProvider } from "./context/TransportContext";
import { usePlayerContext } from "@/context/PlayerContext.tsx";

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
