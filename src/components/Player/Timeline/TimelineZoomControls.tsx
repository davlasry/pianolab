interface Props {
    resetZoom: () => void;
    increaseZoom?: () => void;
    decreaseZoom?: () => void;
}

export const TimelineZoomControls = ({
    resetZoom,
    increaseZoom,
    decreaseZoom,
}: Props) => {
    // Default handlers that use zoomLevel if increaseZoom/decreaseZoom not provided
    const handleIncreaseZoom = () => {
        if (increaseZoom) {
            increaseZoom();
        }
    };

    const handleDecreaseZoom = () => {
        if (decreaseZoom) {
            decreaseZoom();
        }
    };

    return (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            <button
                onClick={handleDecreaseZoom}
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
                onClick={handleIncreaseZoom}
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

            <button
                onClick={resetZoom}
                className="rounded-sm p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                aria-label="Reset zoom"
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
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};
