import React from "react";
import TimeDisplay from "./TimeDisplay";
import TransportControls from "./TransportControls";
import LoopControls from "./LoopControls";
import TempoControl from "./TempoControl";
import FormatSelector from "./FormatSelector";
import { useTransport } from "../context/TransportContext";

const DigitalClock: React.FC = () => {
    const {
        isPlaying,
        currentTime,
        currentFormat,
        tempo,
        timeSignature,
        loopActive,
        loopStart,
        loopEnd,
        togglePlayPause,
        stop,
        rewind,
        fastForward,
        setCurrentFormat,
        setTempo,
        setTimeSignature,
        toggleLoop,
        setLoopStart,
        setLoopEnd,
        isReady,
    } = useTransport();

    return (
        <div
            className={`w-full max-w-3xl bg-zinc-800 rounded-xl shadow-2xl overflow-hidden border border-zinc-700 transition-all duration-300 ${isPlaying ? "shadow-blue-900/20" : ""}`}
        >
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <TimeDisplay
                        currentTime={currentTime}
                        currentFormat={currentFormat}
                        isPlaying={isPlaying}
                    />
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <TempoControl
                                tempo={tempo}
                                timeSignature={timeSignature}
                                onTempoChange={setTempo}
                                onSignatureChange={setTimeSignature}
                            />
                            <FormatSelector
                                currentFormat={currentFormat}
                                onFormatChange={setCurrentFormat}
                            />
                        </div>
                        <TransportControls
                            isPlaying={isPlaying}
                            onPlayPause={togglePlayPause}
                            onStop={stop}
                            onRewind={rewind}
                            onFastForward={fastForward}
                            isReady={isReady}
                        />
                        {currentFormat !== "seconds" && (
                            <LoopControls
                                loopActive={loopActive}
                                loopStart={loopStart}
                                loopEnd={loopEnd}
                                onToggleLoop={toggleLoop}
                                onLoopStartChange={setLoopStart}
                                onLoopEndChange={setLoopEnd}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalClock;
