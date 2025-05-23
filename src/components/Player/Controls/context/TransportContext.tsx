import {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
    useRef,
    type PropsWithChildren,
} from "react";
import type { TransportClass } from "tone/build/esm/core/clock/Transport";
import { useSpaceBarControl } from "@/components/Player/hooks/useSpaceBarControl.ts";

type TimeFormat = "smpte" | "bars" | "seconds";

interface TransportContextType {
    isReady: boolean;
    isPlaying: boolean;
    currentTime: string;
    currentFormat: TimeFormat;
    tempo: number;
    timeSignature: string;
    loopActive: boolean;
    loopStart: string;
    loopEnd: string;
    togglePlayPause: () => void;
    stop: () => void;
    rewind: () => void;
    fastForward: () => void;
    setCurrentFormat: (format: TimeFormat) => void;
    setTempo: (tempo: number) => void;
    setTimeSignature: (signature: string) => void;
    toggleLoop: () => void;
    setLoopStart: (time: string) => void;
    setLoopEnd: (time: string) => void;
}

const TransportContext = createContext<TransportContextType | null>(null);

export const useTransport = () => {
    const context = useContext(TransportContext);
    if (!context) {
        throw new Error("useTransport must be used within a TransportProvider");
    }
    return context;
};

export const TransportProvider = ({
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop,
    getTransport,
    handleMoveToBeginning,
    isReady,
    children,
}: PropsWithChildren<{
    isPlaying: boolean;
    isPaused: boolean;
    isReady: boolean;
    play: () => void;
    pause: () => void;
    stop: () => void;
    resume: () => void;
    getTransport: () => TransportClass;
    handleMoveToBeginning: () => void;
}>) => {
    // const [isPlaying, setIsPlaying] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [currentFormat, setCurrentFormat] = useState<TimeFormat>("smpte");
    const [tempo, setTempo] = useState(120);
    const [timeSignature, setTimeSignature] = useState("4/4");
    // const [loopActive, setLoopActive] = useState(false);
    const [loopStart, setLoopStart] = useState("00:00:00:00");
    const [loopEnd, setLoopEnd] = useState("00:01:00:00");

    const rafId = useRef<number>(null);

    useEffect(() => {
        const tick = () => {
            setElapsedTime(getTransport().seconds); // read once per frame
            rafId.current = requestAnimationFrame(tick);
        };
        // start when component mounts
        rafId.current = requestAnimationFrame(tick);
        // and stop when it unmounts
        return () => cancelAnimationFrame(rafId.current!);
    }, []);

    const handlePlay = useCallback(() => {
        if (isPaused) {
            resume();
        } else {
            play();
        }
    }, [isPaused, play, resume]);

    useSpaceBarControl({
        isReady,
        isPlaying,
        isPaused,
        onPlay: handlePlay,
        onPause: pause,
        onResume: resume,
    });

    const formatTime = useCallback(
        (timeInMs: number): string => {
            const clampedTime = Math.min(Math.max(timeInMs, 0), 359999999); // Max: 99:59:59:23

            if (currentFormat === "smpte") {
                const hours = Math.floor(clampedTime / 3600000)
                    .toString()
                    .padStart(2, "0");
                const minutes = Math.floor((clampedTime % 3600000) / 60000)
                    .toString()
                    .padStart(2, "0");
                const seconds = Math.floor((clampedTime % 60000) / 1000)
                    .toString()
                    .padStart(2, "0");
                const frames = Math.floor((clampedTime % 1000) / 41.6667) % 24; // Ensure frames stay within 0-23

                return `${hours}:${minutes}:${seconds}:${frames.toString().padStart(2, "0")}`;
            } else if (currentFormat === "bars") {
                const beatsPerMs = tempo / 60000;
                const totalBeats = clampedTime * beatsPerMs;
                const beatsPerBar = parseInt(timeSignature.split("/")[0]);

                const bars = Math.floor(totalBeats / beatsPerBar) + 1;
                const beats = Math.floor(totalBeats % beatsPerBar) + 1;
                const ticks = Math.floor((totalBeats % 1) * 960) % 960; // Ensure ticks stay within 0-959

                return `${Math.min(bars, 999).toString().padStart(3, "0")}:${beats.toString().padStart(2, "0")}:${ticks.toString().padStart(3, "0")}`;
            } else {
                return (clampedTime / 1000).toFixed(2);
            }
        },
        [currentFormat, tempo, timeSignature],
    );

    useEffect(() => {
        let animationFrameId: number;
        let lastTime: number;

        const updateClock = (timestamp: number) => {
            if (!isPlaying) return;

            if (!lastTime) {
                lastTime = timestamp;
            }

            // const deltaTime = timestamp - lastTime;
            // lastTime = timestamp;

            // setElapsedTime((prevTime) => {
            //     const newTime =
            //         startTime !== null
            //             ? timestamp - startTime
            //             : prevTime + deltaTime;
            //     return Math.min(newTime, 359999999); // Prevent overflow
            // });

            animationFrameId = requestAnimationFrame(updateClock);
        };

        if (isPlaying) {
            lastTime = 0;
            animationFrameId = requestAnimationFrame(updateClock);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying]);

    // const togglePlayPause = useCallback(() => {
    // setIsPlaying(prev => {
    //   if (!prev) {
    //     setStartTime(elapsedTime === 0 ? performance.now() : performance.now() - elapsedTime);
    //   }
    //   return !prev;
    // });
    // }, [elapsedTime]);

    // const rewind = useCallback(() => {
    //     // const newTime = Math.max(0, elapsedTime - 5000);
    //     // setElapsedTime(newTime);
    //     if (startTime !== null) {
    //         setStartTime(performance.now() - newTime);
    //     }
    // }, [elapsedTime, startTime]);

    // const fastForward = useCallback(() => {
    //     const newTime = Math.min(359999999, elapsedTime + 5000);
    //     setElapsedTime(newTime);
    //     if (startTime !== null) {
    //         setStartTime(performance.now() - newTime);
    //     }
    // }, [elapsedTime, startTime]);

    // const toggleLoop = useCallback(() => {
    //     setLoopActive((prev) => !prev);
    // }, []);

    const currentTime = formatTime(elapsedTime * 1000);

    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            pause();
            return;
        }

        handlePlay();
    }, [isPlaying, handlePlay, pause]);

    return (
        <TransportContext.Provider
            value={{
                isPlaying,
                currentTime,
                currentFormat,
                tempo,
                timeSignature,
                loopActive: false,
                loopStart,
                loopEnd,
                togglePlayPause,
                stop: () => {
                    stop();
                    handleMoveToBeginning();
                },
                rewind: () => {},
                fastForward: () => {},
                setCurrentFormat,
                setTempo,
                setTimeSignature,
                toggleLoop: () => {},
                setLoopStart,
                setLoopEnd,
                isReady,
            }}
        >
            {children}
        </TransportContext.Provider>
    );
};
