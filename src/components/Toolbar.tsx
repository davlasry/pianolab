export const Toolbar = ({ onPlay, onPause, onStop, isReady }: any) => {
    return (
        <div className="flex gap-4">
            <button
                onClick={onPlay}
                disabled={!isReady}
                aria-label="Play"
                className="p-2 bg-gray-800 text-gray-200 rounded hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            </button>
            <button
                onClick={onPause}
                disabled={!isReady}
                aria-label="Pause"
                className="p-2 bg-gray-800 text-gray-200 rounded hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            </button>
            <button
                onClick={onStop}
                disabled={!isReady}
                aria-label="Stop"
                className="p-2 bg-gray-800 text-gray-200 rounded hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="4" y="4" width="16" height="16"></rect>
                </svg>
            </button>
        </div>
    );
};
