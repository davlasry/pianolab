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
                className={`rounded-md px-3 py-1 text-xs transition-colors ${
                    currentFormat === "smpte"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
                SMPTE
            </button>
            <button
                onClick={() => onFormatChange("bars")}
                className={`rounded-md px-3 py-1 text-xs transition-colors ${
                    currentFormat === "bars"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
                BARS
            </button>
            <button
                onClick={() => onFormatChange("seconds")}
                className={`rounded-md px-3 py-1 text-xs transition-colors ${
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
