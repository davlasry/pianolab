import { cn } from "@/lib/utils.ts";

export interface TimeDisplayProps {
    time: number;
    isPlaying: boolean;
    className?: string;
}

export function TimeDisplay({ time, className }: TimeDisplayProps) {
    // Format time as HH:MM:SS:MS
    const formatTime = (timeInSeconds: number) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const milliseconds = Math.floor((timeInSeconds % 1) * 1000);

        return {
            hours: hours.toString().padStart(2, "0"),
            minutes: minutes.toString().padStart(2, "0"),
            seconds: seconds.toString().padStart(2, "0"),
            milliseconds: milliseconds
                .toString()
                .padStart(3, "0")
                .substring(0, 2),
        };
    };

    const { hours, minutes, seconds, milliseconds } = formatTime(time);

    return (
        <div className={cn("flex flex-col", className)}>
            <div className="flex justify-center">
                <div className="flex w-full justify-start text-center font-mono text-3xl tracking-tight">
                    <div className="flex items-baseline">
                        <span className="text-zinc-400">{hours}</span>
                        <span className="mx-1 text-xl text-zinc-600">:</span>
                        <span className="text-zinc-400">{minutes}</span>
                        <span className="mx-1 text-xl text-zinc-600">:</span>
                        <span className="text-zinc-400">{seconds}</span>
                        <span className="mx-1 text-xl text-zinc-600">.</span>
                        <span className="text-2xl text-zinc-500">
                            {milliseconds}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
