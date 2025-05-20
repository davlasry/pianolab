export const Toolbar = ({ onPlay, onPause, onStop, isReady }: any) => {
    return (
        <div>
            <button onClick={onPlay} disabled={!isReady}>
                Play
            </button>
            <button onClick={onPause}>Pause</button>
            <button onClick={onPlay}>Resume</button>
            <button onClick={onStop}>Stop</button>
        </div>
    );
};
