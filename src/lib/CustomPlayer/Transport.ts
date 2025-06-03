import type {
    TransportState,
    TransportEvent,
    TransportCallback,
} from "./types";

/**
 * Transport class that handles timing and scheduling
 * Uses Web Audio API's AudioContext.currentTime as the source of truth for timing
 */
export class Transport {
    private context: AudioContext;
    private state: TransportState = "stopped";
    private startTime: number = 0; // When playback started (in context time)
    private pauseTime: number = 0; // How far we were when paused (in seconds)
    private offset: number = 0; // Current offset when seeking (in seconds)
    private _playbackRate: number = 1; // Playback rate multiplier
    private events: Map<
        TransportEvent | "transportchange",
        Set<TransportCallback>
    > = new Map();
    private animationFrameId: number | null = null;
    private frameInterval: number; // Milliseconds between animation frames

    /**
     * Create a new Transport instance
     * @param fps Frame rate for the animation loop (default: 60)
     */
    constructor(fps: number = 60) {
        this.context = new AudioContext();
        this.frameInterval = 1000 / fps;

        // Initialize events map
        [
            "start",
            "pause",
            "stop",
            "seek",
            "ratechange",
            "transportchange",
        ].forEach((event) => {
            this.events.set(
                event as TransportEvent | "transportchange",
                new Set(),
            );
        });
    }

    /**
     * Get the current transport time in seconds
     */
    public get seconds(): number {
        if (this.state === "stopped") {
            return this.offset;
        } else if (this.state === "paused") {
            return this.pauseTime;
        } else {
            // Calculate time based on context time, accounting for playback rate
            const elapsed =
                (this.context.currentTime - this.startTime) *
                this._playbackRate;
            return this.pauseTime + elapsed;
        }
    }

    /**
     * Get the current AudioContext
     */
    public get audioContext(): AudioContext {
        return this.context;
    }

    /**
     * Get the current playback rate
     */
    public get playbackRate(): number {
        return this._playbackRate;
    }

    /**
     * Set the playback rate
     * @param rate New playback rate (0.25 to 2.0)
     */
    public set playbackRate(rate: number) {
        // Clamp rate between reasonable values
        const clampedRate = Math.max(0.25, Math.min(2.0, rate));

        if (this._playbackRate !== clampedRate) {
            // If we're playing, we need to recalculate our times
            if (this.state === "playing") {
                // Capture current time before changing rate
                this.pauseTime = this.seconds;
                this.startTime = this.context.currentTime;
            }

            this._playbackRate = clampedRate;
            this.emit("ratechange", this.seconds);
        }
    }

    /**
     * Get the current transport state
     */
    public get transportState(): TransportState {
        return this.state;
    }

    /**
     * Start playback
     */
    public start(): void {
        if (this.state === "stopped" || this.state === "paused") {
            // Resume the audio context if it's suspended
            if (this.context.state === "suspended") {
                this.context.resume();
            }

            this.startTime = this.context.currentTime;
            this.state = "playing";

            // Start the animation frame loop
            this.startAnimationLoop();

            this.emit("start", this.seconds);
        }
    }

    /**
     * Pause playback
     */
    public pause(): void {
        if (this.state === "playing") {
            // Store the current position
            this.pauseTime = this.seconds;
            this.state = "paused";

            // Stop the animation frame loop
            this.stopAnimationLoop();

            this.emit("pause", this.seconds);
        }
    }

    /**
     * Stop playback and reset position
     */
    public stop(): void {
        if (this.state !== "stopped") {
            this.pauseTime = 0;
            this.offset = 0;
            this.state = "stopped";

            // Stop the animation frame loop
            this.stopAnimationLoop();

            this.emit("stop", 0);
        }
    }

    /**
     * Seek to a specific time
     * @param time Time in seconds
     */
    public seek(time: number): void {
        const wasPlaying = this.state === "playing";

        // If playing, pause temporarily
        if (wasPlaying) {
            this.pause();
        }

        // Update times
        this.pauseTime = time;
        this.offset = time;

        // If it was playing, resume
        if (wasPlaying) {
            this.start();
        }

        this.emit("seek", time);
    }

    /**
     * Schedule a callback to run at a specific time
     * @param callback Function to call
     * @param time Time in seconds when the callback should be executed
     * @returns ID that can be used to cancel the scheduled callback
     */
    public scheduleOnce(callback: () => void, time: number): number {
        // Convert transport time to actual time considering playback rate
        const adjustedTime =
            this.startTime + (time - this.pauseTime) / this._playbackRate;

        // Calculate the delay in milliseconds
        const delay = Math.max(
            0,
            (adjustedTime - this.context.currentTime) * 1000,
        );

        // Use setTimeout for scheduling
        return window.setTimeout(() => {
            callback();
        }, delay);
    }

    /**
     * Cancel a scheduled callback
     * @param id ID of the scheduled callback
     */
    public cancelScheduled(id: number): void {
        window.clearTimeout(id);
    }

    /**
     * Add an event listener
     * @param event Event type
     * @param callback Callback function
     */
    public on(
        event: TransportEvent | "transportchange",
        callback: TransportCallback,
    ): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.add(callback);
        }
    }

    /**
     * Remove an event listener
     * @param event Event type
     * @param callback Callback function
     */
    public off(
        event: TransportEvent | "transportchange",
        callback: TransportCallback,
    ): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    /**
     * Emit an event
     * @param event Event type
     * @param time Current time
     */
    private emit(
        event: TransportEvent | "transportchange",
        time: number,
    ): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => callback(time));
        }
    }

    /**
     * Start the animation frame loop
     */
    private startAnimationLoop(): void {
        if (this.animationFrameId === null) {
            let lastFrameTime = performance.now();

            const loop = (now: number) => {
                if (now - lastFrameTime >= this.frameInterval) {
                    // Emit the current time to all transport listeners
                    this.emit("transportchange", this.seconds);

                    lastFrameTime = now;
                }

                this.animationFrameId = requestAnimationFrame(loop);
            };

            this.animationFrameId = requestAnimationFrame(loop);
        }
    }

    /**
     * Stop the animation frame loop
     */
    private stopAnimationLoop(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Dispose the transport and clean up resources
     */
    public dispose(): void {
        this.stop();
        this.events.clear();

        // Close the audio context
        if (this.context.state !== "closed") {
            this.context.close();
        }
    }
}
