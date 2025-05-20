// Clock.tsx
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export const Clock = () => {
    const [time, setTime] = useState(0); // seconds
    const rafId = useRef<number>(null);

    useEffect(() => {
        const tick = () => {
            setTime(Tone.getTransport().seconds); // read once per frame
            rafId.current = requestAnimationFrame(tick);
        };

        // start when component mounts
        rafId.current = requestAnimationFrame(tick);

        // and stop when it unmounts
        return () => cancelAnimationFrame(rafId.current!);
    }, []);

    return <span>{time.toFixed(2)} s</span>;
};
