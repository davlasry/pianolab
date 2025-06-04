import { useCallback } from "react";
import { useCustomPlayerStore } from "@/stores/customPlayerStore";

const RATE_OPTIONS = [
    { value: 0.25, label: "0.25x" },
    { value: 0.5, label: "0.5x" },
    { value: 0.75, label: "0.75x" },
    { value: 1, label: "1x" },
    { value: 1.25, label: "1.25x" },
    { value: 1.5, label: "1.5x" },
    { value: 2, label: "2x" },
];

export function PlaybackRateSelector() {
    const { playbackRate, setPlaybackRate } = useCustomPlayerStore();

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setPlaybackRate(parseFloat(e.target.value));
        },
        [setPlaybackRate],
    );

    return (
        <div className="flex items-center gap-2">
            <label
                htmlFor="playback-rate"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                aria-label="Playback rate"
            >
                Speed
            </label>
            <select
                id="playback-rate"
                value={playbackRate}
                onChange={handleChange}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Select playback rate"
            >
                {RATE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
