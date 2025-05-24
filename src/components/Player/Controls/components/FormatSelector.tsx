interface FormatSelectorProps {
    currentFormat: string;
    onFormatChange: (format: "smpte" | "bars" | "seconds") => void;
}

const FormatSelector = ({
    currentFormat,
    onFormatChange,
}: FormatSelectorProps) => {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onFormatChange("smpte")}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    currentFormat === "smpte"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
                SMPTE
            </button>
            <button
                onClick={() => onFormatChange("bars")}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    currentFormat === "bars"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
                BARS
            </button>
            <button
                onClick={() => onFormatChange("seconds")}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    currentFormat === "seconds"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
                SEC
            </button>
        </div>
    );
};

export default FormatSelector;
