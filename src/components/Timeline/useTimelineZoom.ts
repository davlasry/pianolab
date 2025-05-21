import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash-es";

const STORAGE_KEY = "timeline-zoom-level";
const DEBOUNCE_MS = 300;

export const useTimelineZoom = () => {
    const [zoomLevel, setZoomLevel] = useState(1);

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

    // Update zoom level and trigger debounced save
    const updateZoom = (newZoom: number) => {
        setZoomLevel(newZoom);
        debouncedSave(newZoom);
    };

    // Clean up the debounced function
    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, [debouncedSave]);

    return {
        zoomLevel,
        updateZoom,
    };
};
