import React from "react";
import { useZoomLevel, useKeyboardActions } from "../stores/keyboardStore";

export const ZoomControls: React.FC = () => {
    const zoomLevel = useZoomLevel();
    const { increaseZoom, decreaseZoom } = useKeyboardActions();

    return (
        <div className="flex items-center gap-1 rounded-md border border-neutral-800 bg-black/75 px-1.5 py-1 shadow-md backdrop-blur-sm">
            <button
                onClick={decreaseZoom}
                className="rounded-sm p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                aria-label="Zoom out"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
            </button>

            <button
                onClick={increaseZoom}
                className="rounded-sm p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                aria-label="Zoom in"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
            </button>
        </div>
    );
};
