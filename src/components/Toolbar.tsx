export const Toolbar = ({ onPlay, onPause, onStop, isReady }: any) => {
    return (
        <div className="flex gap-4">
            <button
                onClick={onPlay}
                disabled={!isReady}
                aria-label="Play"
                className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-400 cursor-pointer disabled:opacity-50"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M8 5v14l11-7z" />
                </svg>
            </button>
            <button
                onClick={onPause}
                disabled={!isReady}
                aria-label="Pause"
                className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-400 cursor-pointer disabled:opacity-50"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
            </button>
            <button
                onClick={onPlay}
                aria-label="Resume"
                className="p-2 bg-white text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M8 5v14l11-7z" />
                </svg>
            </button>
            <button
                onClick={onStop}
                disabled={!isReady}
                aria-label="Stop"
                className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-400 cursor-pointer disabled:opacity-50"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6 6h12v12H6z" />
                </svg>
            </button>
        </div>
    );
};
