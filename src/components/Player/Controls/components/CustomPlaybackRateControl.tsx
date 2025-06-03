import { useState, useEffect, useRef } from "react";
import { useCustomPlayerContext } from "@/components/Player/context/CustomPlayerContext";
import { useCustomPlayerStore } from "@/stores/customPlayerStore";

export function CustomPlaybackRateControl() {
    const { playbackRate: storeRate, setPlaybackRate: storeSetRate } =
        useCustomPlayerStore();
    const { setPlaybackRate } = useCustomPlayerContext();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Common playback rates
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

    // Handle rate change in both store and player
    const handleRateChange = (newRate: number) => {
        console.log("Setting custom player playback rate to:", newRate);
        // Update the store
        storeSetRate(newRate);
        // Update the player directly
        setPlaybackRate(newRate);
        // Close dropdown
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Format rate for display
    const formatRate = (value: number) => {
        return `${value}x`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-8 items-center gap-1 rounded bg-secondary px-3 text-xs text-secondary-foreground hover:bg-secondary/80"
                aria-label="Change playback speed"
                title="Change playback speed"
            >
                <span className="font-medium">
                    Speed: {formatRate(storeRate)}
                </span>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 z-50 mb-1 w-28 rounded-md border bg-popover p-1 shadow-md">
                    <div className="flex flex-col gap-1">
                        {rates.map((r) => (
                            <button
                                key={r}
                                className={`flex h-8 w-full items-center justify-between rounded px-2 text-xs ${
                                    r === storeRate
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                }`}
                                onClick={() => handleRateChange(r)}
                                title={`Set speed to ${formatRate(r)}`}
                            >
                                {formatRate(r)}
                                {r === storeRate && (
                                    <span className="ml-1">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
