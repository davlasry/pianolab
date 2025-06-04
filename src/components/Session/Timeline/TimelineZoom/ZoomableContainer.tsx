import type { MouseEvent, WheelEvent, ReactNode, DragEvent } from "react";
import { useEffect } from "react";

const ZOOM_SENSITIVITY = 0.02; // Adjust this value to control zoom sensitivity

interface ZoomableContainerProps {
    outerRef: React.RefObject<HTMLDivElement | null>;
    innerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
    onWheel: (e: WheelEvent<HTMLDivElement>) => void;
    onClick: (e: MouseEvent<HTMLDivElement>) => void;
    onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
    onDrop?: (e: DragEvent<HTMLDivElement>) => void;
    onZoomChange?: (
        newZoom: number,
        // Optional: The following are for zoom-to-cursor
        contentAnchor?: number, // The point in the unzoomed content (e.g., pixels from start) under the cursor
        viewportAnchor?: number, // The mouse X position relative to the viewport (outerRef)
    ) => void;
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

    useEffect(() => {
        const innerElement = innerRef.current;
        const outerElement = outerRef.current; // Need outerRef for calculations
        if (!innerElement || !outerElement || !onWheel) return; // Add outerElement check

        const handleWheel = (e: Event) => {
            const wheelEvent = e as unknown as WheelEvent<HTMLDivElement>;

            // Only handle zoom if it's a pinch gesture (e.ctrlKey is true for both pinch and Ctrl+wheel)
            if (wheelEvent.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();

                // Calculate mouse position relative to the outer container (viewport)
                const mouseX_viewport =
                    wheelEvent.clientX -
                    outerElement.getBoundingClientRect().left;
                const currentScrollLeft = outerElement.scrollLeft;
                // currentZoomLevel is the zoomLevel prop

                // Calculate the point in the "unzoomed" content that the cursor is over
                // This is the invariant point we want to maintain relative to the cursor
                const contentX_at_cursor =
                    (currentScrollLeft + mouseX_viewport) / zoomLevel;

                let newCalculatedZoom: number | undefined;

                if (wheelEvent.ctrlKey && !wheelEvent.deltaY) {
                    // Pinch gestures
                    const scale = (wheelEvent as unknown as { scale: number })
                        .scale;
                    if (scale) {
                        newCalculatedZoom = Math.max(1, zoomLevel * scale);
                    }
                } else {
                    // Ctrl+Wheel
                    const zoomFactor = 1 - wheelEvent.deltaY * ZOOM_SENSITIVITY; // Adjust sensitivity as needed
                    newCalculatedZoom = Math.max(1, zoomLevel * zoomFactor);
                }

                if (
                    newCalculatedZoom !== undefined &&
                    newCalculatedZoom !== zoomLevel
                ) {
                    onZoomChange?.(
                        newCalculatedZoom,
                        contentX_at_cursor,
                        mouseX_viewport,
                    );
                }
                return;
            }

            onWheel(wheelEvent as unknown as WheelEvent<HTMLDivElement>);
        };

        innerElement.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
            innerElement.removeEventListener("wheel", handleWheel);
        };
    }, [innerRef, outerRef, onWheel, zoomLevel, onZoomChange]); // Added outerRef to dependencies

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
