import type { MouseEvent, WheelEvent, ReactNode } from "react";

interface ZoomableContainerProps {
    outerRef: React.RefObject<HTMLDivElement | null>;
    innerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
    height: number;
    onWheel: (e: WheelEvent<HTMLDivElement>) => void;
    onClick: (e: MouseEvent<HTMLDivElement>) => void;
    children: ReactNode;
}

export function ZoomableContainer({
    outerRef,
    innerRef,
    zoomLevel,
    height,
    onWheel,
    onClick,
    children,
}: ZoomableContainerProps) {
    return (
        <div
            ref={outerRef}
            className="relative w-full overflow-x-auto bg-muted"
        >
            <div
                ref={innerRef}
                onWheel={onWheel}
                onClick={onClick}
                className="relative bg-muted overflow-hidden"
                style={{
                    height,
                    width: `${100 * zoomLevel}%`,
                    minWidth: "100%",
                }}
            >
                {children}
            </div>
        </div>
    );
}
