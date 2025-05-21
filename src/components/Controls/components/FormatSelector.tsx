import React from "react";

interface FormatSelectorProps {
    currentFormat: string;
    onFormatChange: (format: "smpte" | "bars" | "seconds") => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({
    currentFormat,
    onFormatChange,
}) => {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onFormatChange("smpte")}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    currentFormat === "smpte"
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
            >
                SMPTE
            </button>
            <button
                onClick={() => onFormatChange("bars")}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    currentFormat === "bars"
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
            >
                BARS
            </button>
            <button
                onClick={() => onFormatChange("seconds")}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    currentFormat === "seconds"
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
            >
                SEC
            </button>
        </div>
    );
};

export default FormatSelector;
