import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash-es";

const STORAGE_KEY = "timeline-zoom-level";
const DEBOUNCE_MS = 300;

interface ZoomAnchor {
    contentAnchor: number;
    viewportAnchor: number;
}

export const useTimelineZoom = (outerRef: React.RefObject<HTMLDivElement>) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const zoomAnchorRef = useRef<ZoomAnchor | null>(null);

    // Load saved zoom level on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setZoomLevel(parseFloat(saved));
            }
        } catch (error) {
            console.error("Failed to load zoom level:", error);
        }
    }, []);

    // Create debounced save function
    const debouncedSave = useRef(
        debounce((zoom: number) => {
            try {
                localStorage.setItem(STORAGE_KEY, zoom.toString());
            } catch (error) {
                console.error("Failed to save zoom level:", error);
            }
        }, DEBOUNCE_MS),
    ).current;

    // Handle zoom changes with optional anchor points
    const handleZoomChange = (
        newZoom: number,
        contentAnchor?: number,
        viewportAnchor?: number,
    ) => {
        if (newZoom === zoomLevel) return;

        if (contentAnchor !== undefined && viewportAnchor !== undefined) {
            zoomAnchorRef.current = { contentAnchor, viewportAnchor };
        } else {
            zoomAnchorRef.current = null;
        }

        setZoomLevel(newZoom);
        debouncedSave(newZoom);
    };

    // Apply scroll adjustment after zoom level changes
    useEffect(() => {
        if (zoomAnchorRef.current && outerRef.current) {
            const { contentAnchor, viewportAnchor } = zoomAnchorRef.current;
            const outerElement = outerRef.current;

            // Calculate and apply the new scroll position
            const newScrollLeft = contentAnchor * zoomLevel - viewportAnchor;
            const maxScrollLeft = outerElement.scrollWidth - outerElement.clientWidth;
            outerElement.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));

            // Clear the anchor details after applying them
            zoomAnchorRef.current = null;
        }
    }, [zoomLevel, outerRef]);

    // Reset zoom level and clear anchors
    const resetZoom = () => {
        zoomAnchorRef.current = null;
        handleZoomChange(1);
    };

    // Clean up the debounced function
    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, [debouncedSave]);

    return {
        zoomLevel,
        handleZoomChange,
        resetZoom,
    };
};
