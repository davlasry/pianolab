import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Baseline, Music } from "lucide-react";

interface KeyboardDisplayToggleButtonProps {
    showChordNotes: boolean;
    toggleShowChordNotes: () => void;
    showNoteDegrees: boolean;
    toggleShowNoteDegrees: () => void;
}

export function KeyboardControls({
    showChordNotes,
    toggleShowChordNotes,
    showNoteDegrees,
    toggleShowNoteDegrees,
}: KeyboardDisplayToggleButtonProps) {
    return (
        <div className="flex gap-2 px-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleShowChordNotes}
                            className={showChordNotes ? "bg-accent" : ""}
                        >
                            <Music className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle chord notes</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleShowNoteDegrees}
                            className={showNoteDegrees ? "bg-accent" : ""}
                        >
                            <Baseline className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle note degrees</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
