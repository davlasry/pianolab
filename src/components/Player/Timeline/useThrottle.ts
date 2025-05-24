import { useRef } from "react";

export function useThrottle<T extends (...args: any[]) => void>(
    fn: T,
    delay = 50,
): T {
    const last = useRef<number>(0);

    return ((...args: any[]) => {
        const now = Date.now();
        if (now - last.current >= delay) {
            fn(...args);
            last.current = now;
        }
    }) as T;
}
