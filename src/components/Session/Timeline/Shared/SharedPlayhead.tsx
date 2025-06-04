import { useEffect } from "react";

interface SharedPlayheadProps {
    duration: number;
    percent: number;
    currentTime: number;
    barRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
}

/**
 * A shared playhead component that can be used by both player implementations.
 * This component is UI-only and receives all its state and refs as props.
 */
export function SharedPlayhead({
    duration,
    percent,
    currentTime,
    barRef,
    containerRef,
    zoomLevel,
}: SharedPlayheadProps) {
    // Optimized playhead animation with CSS custom properties
    useEffect(() => {
        if (barRef.current && containerRef.current) {
            // Calculate base width without zoom
            const baseWidth = containerRef.current.scrollWidth / zoomLevel;
            // Apply zoom to the position calculation
            const x = percent * baseWidth * zoomLevel;
            
            // Offset by half the icon width (10px) to center the icon on the position
            const centeredX = x - 10;
            
            // Use CSS custom property for better performance
            barRef.current.style.setProperty('--playhead-x', `${centeredX}px`);
        }
    }, [barRef, containerRef, percent, zoomLevel]);

    return (
        <div
            ref={barRef}
            className="playhead-bar absolute top-0 bottom-0 z-20 flex flex-col items-center"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            aria-label="Playback position"
            tabIndex={0}
            style={{ transform: 'translateX(var(--playhead-x, 0px))' }}
        >
            {/* Playhead icon */}
            <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                className="flex-shrink-0 drop-shadow-sm"
                style={{ marginTop: '-2px' }}
            >
                <path
                    d="M2 2 C2 0.895 2.895 0 4 0 L16 0 C17.105 0 18 0.895 18 2 L18 12 C18 12.552 17.776 13.079 17.382 13.447 L10.618 19.447 C10.272 19.772 9.728 19.772 9.382 19.447 L2.618 13.447 C2.224 13.079 2 12.552 2 12 L2 2 Z"
                    fill="oklch(0.4365 0.1044 156.7556)"
                />
            </svg>
            {/* Vertical line */}
            <div className="w-0.5 bg-white flex-1 -mt-px" />
        </div>
    );
}
