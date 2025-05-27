import TimeDisplay from "@/components/Player/Controls/components/TimeDisplay.tsx";
import TransportControls from "@/components/Player/Controls/components/TransportControls.tsx";
import { useTransport } from "@/components/Player/Controls/context/TransportContext.tsx";

const DigitalClock = () => {
    const {
        isPlaying,
        currentTime,
        togglePlayPause,
        stop,
        rewind,
        fastForward,
        isReady,
    } = useTransport();

    return (
        <div
            className={`flex-1 overflow-hidden border border-muted bg-muted transition-all duration-300 ${isPlaying ? "shadow-primary/20" : ""}`}
        >
            <div className="p-2">
                <div className="flex flex-col items-center gap-6 md:flex-row">
                    <TimeDisplay
                        currentTime={currentTime}
                        isPlaying={isPlaying}
                    />
                    <div className="flex flex-1 flex-col gap-4">
                        {/*Tempo controls*/}
                        {/*<div className="flex flex-wrap gap-4 items-center justify-between">*/}
                        {/*    <TempoControl*/}
                        {/*        tempo={tempo}*/}
                        {/*        timeSignature={timeSignature}*/}
                        {/*        onTempoChange={setTempo}*/}
                        {/*        onSignatureChange={setTimeSignature}*/}
                        {/*    />*/}
                        {/*</div>*/}
                        <TransportControls
                            isPlaying={isPlaying}
                            onPlayPause={togglePlayPause}
                            onStop={stop}
                            onRewind={rewind}
                            onFastForward={fastForward}
                            isReady={isReady}
                        />
                        {/*<LoopControls*/}
                        {/*    loopActive={loopActive}*/}
                        {/*    loopStart={loopStart}*/}
                        {/*    loopEnd={loopEnd}*/}
                        {/*    onToggleLoop={toggleLoop}*/}
                        {/*    onLoopStartChange={setLoopStart}*/}
                        {/*    onLoopEndChange={setLoopEnd}*/}
                        {/*/>*/}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalClock;
