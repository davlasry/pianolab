import type { KeyboardEvent } from "react";
import { useState, useCallback } from "react";
import { useYouTubeActions, useYouTubeUrl } from "@/stores/youtubeStore.ts";
import { isValidYouTubeUrl } from "@/utils/youtubeUtils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Eye, EyeOff, Youtube } from "lucide-react";
import { cn } from "@/lib/utils.ts";

interface YouTubeUrlInputProps {
    className?: string;
    compact?: boolean;
}

export function YouTubeUrlInput({
    className,
    compact = true,
}: YouTubeUrlInputProps = {}) {
    const storedUrl = useYouTubeUrl();
    const [inputUrl, setInputUrl] = useState(storedUrl || "");
    const [error, setError] = useState<string | null>(null);
    const { setUrl, toggleVisibility, setIsVisible } = useYouTubeActions();

    const handleUrlChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputUrl(e.target.value);
            setError(null);
        },
        [],
    );

    const handleSubmit = useCallback(() => {
        if (!inputUrl.trim()) {
            setError("Please enter a YouTube URL");
            return;
        }

        if (!isValidYouTubeUrl(inputUrl)) {
            setError("Invalid YouTube URL");
            return;
        }

        setUrl(inputUrl);
        setError(null);
        setIsVisible(true); // Automatically show player when URL is submitted
    }, [inputUrl, setUrl, setIsVisible]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                handleSubmit();
            }
        },
        [handleSubmit],
    );

    return (
        <div
            className={cn(
                "flex items-center gap-2",
                compact ? "mx-auto max-w-md" : "",
                className,
            )}
        >
            <div className="relative flex-1">
                <div className="absolute top-1/2 left-2 -translate-y-1/2 text-muted-foreground">
                    <Youtube size={compact ? 14 : 16} />
                </div>
                <Input
                    type="text"
                    placeholder="Enter YouTube URL"
                    value={inputUrl}
                    onChange={handleUrlChange}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "pl-8",
                        compact ? "h-8 text-sm" : "",
                        error
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "",
                    )}
                    aria-label="YouTube URL"
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
            <Button
                variant="outline"
                size={compact ? "sm" : "icon"}
                onClick={handleSubmit}
                aria-label="Load YouTube video"
            >
                <Youtube className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            </Button>
            <Button
                variant="outline"
                size={compact ? "sm" : "icon"}
                onClick={toggleVisibility}
                aria-label="Toggle YouTube player visibility"
            >
                {storedUrl ? (
                    <>
                        <Eye className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                        <span className="sr-only">
                            {storedUrl ? "Show" : "Hide"} YouTube Player
                        </span>
                    </>
                ) : (
                    <EyeOff className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                )}
            </Button>
        </div>
    );
}
