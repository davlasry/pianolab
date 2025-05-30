import DigitalClock from "@/components/Player/Controls/components/DigitalClock.tsx";
import { TransportProvider } from "@/components/Player/Controls/context/TransportContext.tsx";
import { usePlayerContext } from "@/components/Player/context/PlayerContext.tsx";
import { Button } from "@/components/ui/button";
import { ListMusic } from "lucide-react";
import {
    useShowChordNotes,
    useKeyboardActions,
} from "@/components/Player/Keyboard/stores/keyboardStore.ts";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function Controls({
    handleMoveToBeginning,
}: {
    handleMoveToBeginning: () => void;
}) {
    const {
        isPlaying,
        isPaused,
        play,
        stop,
        getTransport,
        resume,
        pause,
        isReady,
    } = usePlayerContext();

    // Use selector hooks instead of direct store access
    const showChordNotes = useShowChordNotes();
    const { toggleShowChordNotes } = useKeyboardActions();

    return (
        <TransportProvider
            isPlaying={isPlaying}
            isPaused={isPaused}
            getTransport={getTransport}
            play={() => play()}
            stop={stop}
            resume={resume}
            pause={pause}
            handleMoveToBeginning={handleMoveToBeginning}
            isReady={isReady}
        >
            <div className="flex flex-1 items-center gap-4 bg-muted">
                <DigitalClock />

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleShowChordNotes}
                                aria-label={
                                    showChordNotes
                                        ? "Hide chord notes"
                                        : "Show chord notes"
                                }
                                className={cn(
                                    "mr-2 h-10 w-10 border-zinc-700 bg-zinc-800/50 text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-zinc-200",
                                    showChordNotes &&
                                        "bg-zinc-700/80 text-white ring-2 ring-zinc-500",
                                )}
                            >
                                <ListMusic className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>
                                {showChordNotes ? "Hide" : "Show"} chord notes
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </TransportProvider>
    );
}

export default Controls;
