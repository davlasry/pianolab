import type { MouseEvent, WheelEvent, ReactNode, DragEvent } from "react";
import { useEffect } from "react";

interface ZoomableContainerProps {
    outerRef: React.RefObject<HTMLDivElement | null>;
    innerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
    onWheel: (e: WheelEvent<HTMLDivElement>) => void;
    onClick: (e: MouseEvent<HTMLDivElement>) => void;
    onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
    onDrop?: (e: DragEvent<HTMLDivElement>) => void;
    children: ReactNode;
}

export function ZoomableContainer({
    outerRef,
    innerRef,
    zoomLevel,
    onWheel,
    onClick,
    onDragOver,
    onDrop,
    children,
}: ZoomableContainerProps) {
    // Use useEffect to add wheel event listener with passive: false
    useEffect(() => {
        const innerElement = innerRef.current;
        if (!innerElement || !onWheel) return;

        const handleWheel = (e: Event) => {
            // Cast the native Event to React's WheelEvent for the callback
            onWheel(e as unknown as WheelEvent<HTMLDivElement>);
        };

        // Add event listener with passive: false to allow preventDefault
        innerElement.addEventListener("wheel", handleWheel, {
            passive: false,
        });

        return () => {
            innerElement.removeEventListener("wheel", handleWheel);
        };
    }, [innerRef, onWheel]);

    return (
        <div
            data-component="ZoomableContainer"
            ref={outerRef}
            className="relative h-40 w-full overflow-x-auto bg-muted pt-6"
            onClick={onClick}
        >
            <div
                ref={innerRef}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className="flex h-full overflow-hidden"
                style={{
                    width: `${100 * zoomLevel}%`,
                    minWidth: "100%",
                }}
            >
                {children}
            </div>
        </div>
    );
}
