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
        <div className="flex items-center gap-4 mt-2">
            <button
                onClick={onToggleLoop}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
                    loopActive
                        ? "bg-orange-600 text-white"
                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
            >
                <Repeat size={14} />
                <span>{loopActive ? "Loop On" : "Loop"}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Start:</span>
                <input
                    type="text"
                    value={loopStart}
                    onChange={(e) => onLoopStartChange(e.target.value)}
                    className="w-20 bg-zinc-900 text-white border border-zinc-700 rounded-md py-1 px-2 text-center focus:border-blue-500 focus:outline-none"
                    disabled={!loopActive}
                />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>End:</span>
                <input
                    type="text"
                    value={loopEnd}
                    onChange={(e) => onLoopEndChange(e.target.value)}
                    className="w-20 bg-zinc-900 text-white border border-zinc-700 rounded-md py-1 px-2 text-center focus:border-blue-500 focus:outline-none"
                    disabled={!loopActive}
                />
            </div>
        </div>
    );
};

export default LoopControls;
