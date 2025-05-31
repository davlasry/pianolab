import { Button } from "@/components/ui/button";
import {
    useAutoScrollEnabled,
    useTimelineActions,
} from "@/stores/timelineStore";
import { AutoScrollIcon } from "./icons/AutoScrollIcon";

export function TimelineAuxControls() {
    const isAutoScrollEnabled = useAutoScrollEnabled();
    const { toggleAutoScroll } = useTimelineActions();

    return (
        <div className="flex gap-2 p-2">
            <Button
                onClick={toggleAutoScroll}
                variant={isAutoScrollEnabled ? "default" : "secondary"}
                size="sm"
                aria-label={`${
                    isAutoScrollEnabled ? "Disable" : "Enable"
                } auto-scroll`}
            >
                <AutoScrollIcon
                    className={`transition-transform ${
                        isAutoScrollEnabled ? "rotate-0" : "-rotate-90"
                    }`}
                />
                Auto-scroll
            </Button>
        </div>
    );
}
