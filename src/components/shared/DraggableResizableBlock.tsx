import React, { useRef, useState, useCallback } from "react";

/**
 * Generic **draggable + edge‑resizable** timeline block (unit‑agnostic).
 *
 * • Pointer Events + `setPointerCapture` = single code path for mouse / touch / pen.
 * • GPU‑friendly: mutates `transform` + `width`; only one React render on commit.
 * • You can style the block normally **and** append extra classes while it is being dragged
 *   via the optional `draggingClassName` prop or attribute selector `[data-dragging]`.
 * • Children are rendered inside and are pointer‑transparent by default.
 */

export interface DraggableResizableBlockProps {
    id: string | number; // identifier forwarded to onCommit
    start: number; // start position (timeline units)
    duration: number; // width (timeline units)
    pixelsPerUnit: number; // scale factor
    onCommit: (id: string | number, start: number, duration: number) => void;
    minDuration?: number; // clamp
    className?: string; // base classes
    draggingClassName?: string; // applied **only while dragging**
    children?: React.ReactNode;
}

export default function DraggableResizableBlock({
    id,
    start,
    duration,
    pixelsPerUnit,
    onCommit,
    minDuration = 0.25,
    className = "",
    draggingClassName = "",
    children,
}: DraggableResizableBlockProps) {
    /* --------------------------------------------------
     * Refs & local state
     * -------------------------------------------------- */
    const blockRef = useRef<HTMLDivElement>(null);
    const live = useRef({
        x: start,
        w: duration,
        originX: 0,
        initX: start,
        initW: duration,
        mode: "move" as "move" | "left" | "right",
    });
    const [, force] = useState({});
    const [isDragging, setIsDragging] = useState(false);

    const pxToUnits = (dxPx: number) => dxPx / pixelsPerUnit;

    /* --------------------------------------------------
     * Commit final position
     * -------------------------------------------------- */
    const commit = useCallback(() => {
        onCommit(id, live.current.x, live.current.w);
        force({});
    }, [id, onCommit]);

    /* --------------------------------------------------
     * Pointer handlers
     * -------------------------------------------------- */
    const onPointerDown = (
        e: React.PointerEvent<HTMLDivElement>,
        mode: "move" | "left" | "right" = "move",
    ) => {
        e.stopPropagation();
        e.preventDefault();
        const el = blockRef.current!;
        el.setPointerCapture(e.pointerId);

        live.current.mode = mode;
        live.current.originX = e.clientX;
        live.current.initX = live.current.x;
        live.current.initW = live.current.w;
        setIsDragging(true);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = blockRef.current;
        if (!el || !el.hasPointerCapture(e.pointerId)) return;

        const dxUnits = pxToUnits(e.clientX - live.current.originX);

        if (live.current.mode === "move") {
            live.current.x = Math.max(0, live.current.initX + dxUnits);
        } else if (live.current.mode === "right") {
            live.current.w = Math.max(
                minDuration,
                live.current.initW + dxUnits,
            );
        } else {
            // resize‑left
            live.current.x = Math.max(0, live.current.initX + dxUnits);
            live.current.w = Math.max(
                minDuration,
                live.current.initW - dxUnits,
            );
        }
        force({});
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = blockRef.current;
        if (!el || !el.hasPointerCapture(e.pointerId)) return;
        el.releasePointerCapture(e.pointerId);
        setIsDragging(false);
        commit();
    };

    /* --------------------------------------------------
     * Derived styles (pixels)
     * -------------------------------------------------- */
    const translateX = live.current.x * pixelsPerUnit;
    const width = live.current.w * pixelsPerUnit;

    /* --------------------------------------------------
     * Compose className & data-attr
     * -------------------------------------------------- */
    const combinedClassName =
        "absolute top-0 h-full select-none " +
        className +
        (isDragging && draggingClassName ? " " + draggingClassName : "");

    return (
        <div
            ref={blockRef}
            data-dragging={isDragging || undefined}
            className={combinedClassName}
            style={{ transform: `translateX(${translateX}px)`, width }}
            tabIndex={0}
            onPointerDown={(e) => onPointerDown(e)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        >
            {/* resize handles */}
            <div
                className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"
                onPointerDown={(e) => onPointerDown(e, "left")}
            />
            <div
                className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
                onPointerDown={(e) => onPointerDown(e, "right")}
            />

            {/* children */}
            <div className="h-full w-full flex items-center justify-center pointer-events-none">
                {children}
            </div>
        </div>
    );
}
