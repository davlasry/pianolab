import { formatTime } from "@/utils/formatTime.ts";

const MAJOR_TICK_INTERVAL = 30; // Major time ticks every 30 seconds
const MINOR_TICK_INTERVAL = 5; // Minor time ticks every 5 seconds

interface Props {
    totalDuration: number;
}

export const TimelineTicks = ({ totalDuration }: Props) => {
    if (totalDuration <= 0) return null;

    const ticks = [];

    // Add all ticks (major and minor)
    for (let time = 0; time <= totalDuration; time += MINOR_TICK_INTERVAL) {
        if (time === 0) continue; // Skip the first tick at 0

        const percent = (time / totalDuration) * 100;
        const isMajorTick = time % MAJOR_TICK_INTERVAL === 0;

        ticks.push(
            <div
                key={time}
                className="absolute h-full"
                style={{ left: `${percent}%` }}
            >
                {/* Full-height tick with different colors based on importance */}
                <div
                    className={`absolute inset-0 ${
                        isMajorTick ? "w-px bg-border" : "w-px bg-border/50"
                    }`}
                ></div>

                {/* Only add label for major ticks */}
                {isMajorTick && (
                    <div className="absolute top-3 -translate-x-1/2 transform text-xs text-muted-foreground">
                        {formatTime(time)}
                    </div>
                )}
            </div>,
        );
    }

    return ticks;
};
