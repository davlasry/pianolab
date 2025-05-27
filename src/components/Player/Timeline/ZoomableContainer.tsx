import type { MouseEvent, WheelEvent, ReactNode, DragEvent } from "react";

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
    return (
        <div
            data-component="ZoomableContainer"
            ref={outerRef}
            className="relative h-36 w-full overflow-x-auto bg-muted pt-8"
            onClick={onClick}
        >
            <div
                ref={innerRef}
                onWheel={onWheel}
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
