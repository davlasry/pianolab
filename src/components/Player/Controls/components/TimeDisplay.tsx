interface TimeDisplayProps {
    currentTime: string;
    isPlaying: boolean;
}

const TimeDisplay = ({ currentTime, isPlaying }: TimeDisplayProps) => {
    return (
        <div className="bg-muted/50 rounded-lg p-2 w-full md:w-70 shadow-inner">
            <div
                className={`font-mono text-center text-xl md:text-xl font-bold tracking-tight transition-colors duration-300 ${isPlaying ? "text-primary" : "text-foreground"}`}
            >
                {currentTime}
            </div>
        </div>
    );
};

export default TimeDisplay;
