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
import { useSpaceBarControl } from "@/components/Session/hooks/useSpaceBarControl.ts";

interface TransportContextType {
    isReady: boolean;
    isPlaying: boolean;
    currentTime: number;
    togglePlayPause: () => void;
    loopActive: boolean;
    loopStart: string;
    loopEnd: string;
    stop: () => void;
    rewind: () => void;
    fastForward: () => void;
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
    const [elapsedTime, setElapsedTime] = useState(0);
    const [loopStart, setLoopStart] = useState("00:00:00:00");
    const [loopEnd, setLoopEnd] = useState("00:01:00:00");

    const rafId = useRef<number>(null);

    useEffect(() => {
        const tick = () => {
            setElapsedTime(getTransport().seconds); // read once per frame
            rafId.current = requestAnimationFrame(tick);
        };
        rafId.current = requestAnimationFrame(tick);
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

    useEffect(() => {
        let animationFrameId: number;
        let lastTime: number;

        const updateClock = (timestamp: number) => {
            if (!isPlaying) return;

            if (!lastTime) {
                lastTime = timestamp;
            }

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

    // const currentTime = formatTime(elapsedTime * 1000);
    const currentTime = elapsedTime;

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
                loopActive: false,
                loopStart,
                loopEnd,
                togglePlayPause,
                stop: () => {
                    stop();
                    handleMoveToBeginning();
                },
                rewind: () => {
                    handleMoveToBeginning();
                },
                fastForward: () => {},
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
