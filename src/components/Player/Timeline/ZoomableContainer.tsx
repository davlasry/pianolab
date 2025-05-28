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
    onZoomChange?: (newZoom: number) => void;
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
    onZoomChange,
    children,
}: ZoomableContainerProps) {
    // Prevent browser zoom
    useEffect(() => {
        const preventBrowserZoom = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };

        // Add both touchstart and touchmove listeners with passive: false
        document.addEventListener("touchstart", preventBrowserZoom, {
            passive: false,
        });
        document.addEventListener("touchmove", preventBrowserZoom, {
            passive: false,
        });

        // Prevent gesture events (specific to Safari)
        const preventGesture = (e: Event) => {
            e.preventDefault();
        };
        document.addEventListener("gesturestart", preventGesture);
        document.addEventListener("gesturechange", preventGesture);
        document.addEventListener("gestureend", preventGesture);

        return () => {
            document.removeEventListener("touchstart", preventBrowserZoom);
            document.removeEventListener("touchmove", preventBrowserZoom);
            document.removeEventListener("gesturestart", preventGesture);
            document.removeEventListener("gesturechange", preventGesture);
            document.removeEventListener("gestureend", preventGesture);
        };
    }, []);

    // Use useEffect to add wheel event listener with passive: false
    useEffect(() => {
        const innerElement = innerRef.current;
        if (!innerElement || !onWheel) return;

        const handleWheel = (e: Event) => {
            const wheelEvent = e as unknown as WheelEvent;

            // Only handle zoom if it's a pinch gesture (e.ctrlKey is true for both pinch and Ctrl+wheel)
            if (wheelEvent.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();

                // For pinch gestures on trackpad, use scale
                if (wheelEvent.ctrlKey && !wheelEvent.deltaY) {
                    const scale = (wheelEvent as unknown as { scale: number })
                        .scale;
                    if (scale) {
                        const newZoom = Math.max(1, zoomLevel * scale);
                        onZoomChange?.(newZoom);
                        return;
                    }
                }

                // For Ctrl+Wheel, use deltaY
                const zoomFactor = 1 - wheelEvent.deltaY * 0.01;
                const newZoom = Math.max(1, zoomLevel * zoomFactor);
                onZoomChange?.(newZoom);
                return;
            }

            // Pass the event to the parent's onWheel handler for non-zoom behavior
            onWheel(wheelEvent as unknown as WheelEvent<HTMLDivElement>);
        };

        // Add event listener with passive: false to allow preventDefault
        innerElement.addEventListener("wheel", handleWheel, {
            passive: false,
        });

        return () => {
            innerElement.removeEventListener("wheel", handleWheel);
        };
    }, [innerRef, onWheel, zoomLevel, onZoomChange]);

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
                    touchAction: "none", // Prevent browser handling of all panning and zooming gestures
                }}
            >
                {children}
            </div>
        </div>
    );
}
