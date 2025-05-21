interface Props {
    updateZoom: (zoomLevel: number) => void;
    zoomLevel: number;
}

export const TimelineZoomControls = ({ updateZoom, zoomLevel }: Props) => {
    return (
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10 text-xs">
            <span className="bg-black/20 px-2 py-1 rounded">
                {Math.round(zoomLevel * 100)}%
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    updateZoom(1);
                }}
                className="bg-black/20 hover:bg-black/30 px-2 py-1 rounded"
            >
                Reset
            </button>
        </div>
    );
};
