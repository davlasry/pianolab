import { Repeat } from "lucide-react";

interface LoopControlsProps {
    loopActive: boolean;
    loopStart: string;
    loopEnd: string;
    onToggleLoop: () => void;
    onLoopStartChange: (time: string) => void;
    onLoopEndChange: (time: string) => void;
}

const LoopControls = ({
    loopActive,
    loopStart,
    loopEnd,
    onToggleLoop,
    onLoopStartChange,
    onLoopEndChange,
}: LoopControlsProps) => {
    return (
        <div className="mt-2 flex items-center gap-4">
            <button
                onClick={onToggleLoop}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                    loopActive
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
                <Repeat size={14} />
                <span>{loopActive ? "Loop On" : "Loop"}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Start:</span>
                <input
                    type="text"
                    value={loopStart}
                    onChange={(e) => onLoopStartChange(e.target.value)}
                    className="w-20 rounded-md border border-input bg-muted/50 px-2 py-1 text-center text-foreground focus:border-primary focus:outline-none"
                    disabled={!loopActive}
                />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>End:</span>
                <input
                    type="text"
                    value={loopEnd}
                    onChange={(e) => onLoopEndChange(e.target.value)}
                    className="w-20 rounded-md border border-input bg-muted/50 px-2 py-1 text-center text-foreground focus:border-primary focus:outline-none"
                    disabled={!loopActive}
                />
            </div>
        </div>
    );
};

export default LoopControls;
