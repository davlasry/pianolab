import { usePlayerContext } from "@/components/Player/context/PlayerContext.tsx";
import { TransportProvider } from "@/components/Player/Controls/context/TransportContext.tsx";
import DigitalClock from "@/components/Player/Controls/components/DigitalClock.tsx";
import { PlaybackRateControl } from "@/components/Player/Controls/components/PlaybackRateControl.tsx";

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
            <div className="flex flex-1 items-center gap-4 bg-muted">
                <DigitalClock />

                <div className="flex items-center gap-2">
                    <PlaybackRateControl />
                </div>
            </div>
        </TransportProvider>
    );
}

export default Controls;
