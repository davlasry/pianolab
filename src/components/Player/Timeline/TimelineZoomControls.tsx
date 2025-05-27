interface Props {
    resetZoom: () => void;
    zoomLevel: number;
}

export const TimelineZoomControls = ({ resetZoom, zoomLevel }: Props) => {
    return (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2 text-xs">
            <span className="rounded bg-muted/20 px-2 py-1 text-foreground">
                {Math.round(zoomLevel * 100)}%
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    resetZoom();
                }}
                className="rounded bg-muted/20 px-2 py-1 text-foreground hover:bg-muted/30"
            >
                Reset
            </button>
        </div>
    );
};
