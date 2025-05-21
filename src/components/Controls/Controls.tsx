import DigitalClock from "./components/DigitalClock";
import { TransportProvider } from "./context/TransportContext";
import { usePlayerContext } from "@/context/PlayerContext.tsx";

function Controls({
    handleMoveToBeginning,
    isReady,
}: {
    handleMoveToBeginning: () => void;
    isReady: boolean;
}) {
    const { isPlaying, isPaused, play, stop, getTransport, resume, pause } =
        usePlayerContext();

    return (
        <div className="bg-zinc-900 flex items-center justify-center p-4">
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
        </div>
    );
}

export default Controls;
