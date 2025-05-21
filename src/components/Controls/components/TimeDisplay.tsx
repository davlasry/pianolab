interface TimeDisplayProps {
    currentTime: string;
    currentFormat: string;
    isPlaying: boolean;
}

const TimeDisplay = ({
    currentTime,
    currentFormat,
    isPlaying,
}: TimeDisplayProps) => {
    return (
        <div className="bg-zinc-900 rounded-lg p-4 w-full md:w-70 shadow-inner">
            <div className="text-center">
                <div
                    className={`font-mono text-3xl md:text-4xl font-bold tracking-tight transition-colors duration-300 ${isPlaying ? "text-blue-400" : "text-white"}`}
                >
                    {currentTime}
                </div>
                <div className="text-zinc-500 text-xs mt-2 uppercase tracking-wider">
                    {currentFormat === "smpte" && "SMPTE Timecode"}
                    {currentFormat === "bars" && "Bars / Beats"}
                    {currentFormat === "seconds" && "Seconds"}
                </div>
            </div>
        </div>
    );
};

export default TimeDisplay;
