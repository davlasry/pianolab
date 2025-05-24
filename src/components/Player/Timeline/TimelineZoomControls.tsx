interface Props {
    resetZoom: () => void;
    zoomLevel: number;
}

export const TimelineZoomControls = ({ resetZoom, zoomLevel }: Props) => {
    return (
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10 text-xs">
            <span className="bg-muted/20 text-foreground px-2 py-1 rounded">
                {Math.round(zoomLevel * 100)}%
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    resetZoom();
                }}
                className="bg-muted/20 hover:bg-muted/30 text-foreground px-2 py-1 rounded"
            >
                Reset
            </button>
        </div>
    );
};
