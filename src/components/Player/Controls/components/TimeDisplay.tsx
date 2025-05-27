interface TimeDisplayProps {
    currentTime: string;
    isPlaying: boolean;
}

const TimeDisplay = ({ currentTime, isPlaying }: TimeDisplayProps) => {
    return (
        <div className="w-full rounded-lg bg-muted/50 p-2 shadow-inner md:w-70">
            <div
                className={`text-center font-mono text-xl font-bold tracking-tight transition-colors duration-300 md:text-xl ${isPlaying ? "text-primary" : "text-foreground"}`}
            >
                {currentTime}
            </div>
        </div>
    );
};

export default TimeDisplay;
