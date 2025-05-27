import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils.ts";

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
    onChange?: (id: string | number, start: number, duration: number) => void; // 🆕 fires during drag
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void; // 🆕 click handler
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
    onChange,
    onClick,
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
    /* `force` is a no-op state setter used purely to force a rerender
   when we want the parent to re-evaluate derived styles.          */
    const [, force] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const [hasDragged, setHasDragged] = useState(false);

    const pxToUnits = (dxPx: number) => dxPx / pixelsPerUnit;

    /* ---------- keep ref & DOM in sync when *not* dragging ---------- */
    useEffect(() => {
        if (isDragging) return; // ignore while user drags

        live.current.x = start;
        live.current.w = duration;

        const el = blockRef.current;
        if (el) {
            el.style.transform = `translateX(${start * pixelsPerUnit}px)`;
            el.style.width = `${duration * pixelsPerUnit}px`;
        }
    }, [start, duration, pixelsPerUnit, isDragging]);

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
        // Check if the event target or its parent has data-interactive-child
        let targetElement = e.target as HTMLElement | null;
        const blockElement = blockRef.current;

        while (targetElement && targetElement !== blockElement) {
            if (targetElement.dataset.interactiveChild === "true") {
                // If it's an interactive child, don't interfere with its events
                return;
            }
            targetElement = targetElement.parentElement;
        }

        e.stopPropagation();
        e.preventDefault();
        const el = blockRef.current!;
        el.setPointerCapture(e.pointerId);

        live.current.mode = mode;
        live.current.originX = e.clientX;
        live.current.initX = live.current.x;
        live.current.initW = live.current.w;
        setIsDragging(true);
        setHasDragged(false);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = blockRef.current;
        if (!el || !el.hasPointerCapture(e.pointerId)) return;

        const dxUnits = pxToUnits(e.clientX - live.current.originX);

        // Mark as dragged if there's any movement
        if (Math.abs(dxUnits) > 0.01) {
            setHasDragged(true);
        }

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

        if (onChange) {
            onChange(id, live.current.x, live.current.w);
        }

        el.style.transform = `translateX(${live.current.x * pixelsPerUnit}px)`;
        el.style.width = `${live.current.w * pixelsPerUnit}px`;
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = blockRef.current;
        if (!el || !el.hasPointerCapture(e.pointerId)) return;
        el.releasePointerCapture(e.pointerId);

        // If we didn't drag, treat it as a click
        if (!hasDragged && onClick) {
            // Create a synthetic MouseEvent from the PointerEvent
            const mouseEvent = {
                ...e,
                type: "click",
                button: 0,
                buttons: 1,
            } as React.MouseEvent<HTMLDivElement>;
            onClick(mouseEvent);
        }

        setIsDragging(false);
        commit();
    };

    /* --------------------------------------------------
     * Derived styles (pixels)
     * -------------------------------------------------- */
    const translateX = live.current.x * pixelsPerUnit;
    const width = live.current.w * pixelsPerUnit;

    const combinedClassName = cn(
        "absolute top-0 bottom-0 select-none",
        className,
        isDragging && draggingClassName,
    );

    return (
        <div
            ref={blockRef}
            data-component="DraggableResizableBlock"
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
                className="absolute top-0 left-0 h-full w-2 cursor-ew-resize"
                onPointerDown={(e) => onPointerDown(e, "left")}
            />
            <div
                className="absolute top-0 right-0 h-full w-2 cursor-ew-resize"
                onPointerDown={(e) => onPointerDown(e, "right")}
            />

            {/* children */}
            <div className="flex h-full w-full items-center justify-center">
                {children}
            </div>
        </div>
    );
}
