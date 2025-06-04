import { Button } from "@/components/ui/button.tsx";
import {
    useAutoScrollEnabled,
    useToggleAutoScroll,
} from "@/stores/timelineStore.ts";
import { AutoScrollIcon } from "src/components/Session/Timeline/icons/AutoScrollIcon.tsx";

export function TimelineAuxControls() {
    const isAutoScrollEnabled = useAutoScrollEnabled();
    const toggleAutoScroll = useToggleAutoScroll();

    return (
        <Button
            onClick={toggleAutoScroll}
            variant={isAutoScrollEnabled ? "default" : "secondary"}
            size="sm"
            className="h-8 gap-1 px-2 text-xs"
            aria-label={`${isAutoScrollEnabled ? "Disable" : "Enable"} auto-scroll`}
            data-testid="auto-scroll-button"
        >
            <AutoScrollIcon
                className={`h-4 w-4 transition-transform ${
                    isAutoScrollEnabled ? "rotate-0" : "-rotate-90"
                }`}
            />
            <span className="sr-only">Auto-scroll</span>
        </Button>
    );
}
