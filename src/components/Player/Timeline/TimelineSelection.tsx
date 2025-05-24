interface TimelineSelectionProps {
    selectionStart: number | null;
    selectionEnd: number | null;
    duration: number;
}

export function TimelineSelection({
    selectionStart,
    selectionEnd,
    duration,
}: TimelineSelectionProps) {
    if (selectionStart === null) return null;

    return (
        <div
            className="absolute top-0 bottom-0 bg-primary/20"
            style={{
                left: `${(selectionStart / duration) * 100}%`,
                width:
                    selectionEnd !== null
                        ? `${((selectionEnd - selectionStart) / duration) * 100}%`
                        : "2px",
            }}
        />
    );
}
