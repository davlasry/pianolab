import { useEffect, type PropsWithChildren } from "react";
import { useCustomPlayerContext } from "@/components/Session/context/CustomPlayerContext";
import { customTransportTicker } from "./customTransportTicker";

export function CustomTransportTickerProvider({ children }: PropsWithChildren) {
    const { currentTime, transportState } = useCustomPlayerContext();

    useEffect(() => {
        let raf: number;

        const tick = () => {
            customTransportTicker.set(currentTime);
            raf = requestAnimationFrame(tick);
        };

        // keep RAF in sync with Transport's state
        const start = () => {
            if (!raf) raf = requestAnimationFrame(tick);
        };

        const stop = () => {
            cancelAnimationFrame(raf);
            raf = 0;
        };

        // Start/stop ticker based on transport state
        if (transportState === "playing") {
            start();
        } else {
            stop();
        }

        return () => {
            stop();
        };
    }, [currentTime, transportState]);

    return <>{children}</>;
}
