import { Transport } from "./Transport";

/**
 * AudioPlayer handles audio file loading, decoding, and playback
 * Uses Web Audio API for precise timing and playback control
 */
export class AudioPlayer {
    private transport: Transport;
    private audioBuffer: AudioBuffer | null = null;
    private audioSource: AudioBufferSourceNode | null = null;
    private gainNode: GainNode;
    private _volume: number = 1.0;
    private _duration: number = 0;
    private isReady: boolean = false;
    private isPlaying: boolean = false;
    private lastStartTime: number = 0;
    private lastOffset: number = 0;

    /**
     * Create a new AudioPlayer
     * @param transport Transport instance for timing
     */
    constructor(transport: Transport) {
        this.transport = transport;

        // Create gain node for volume control
        this.gainNode = this.transport.audioContext.createGain();
        this.gainNode.connect(this.transport.audioContext.destination);

        // Listen for transport events
        this.transport.on("stop", () => {
            this.stopSource();
        });

        this.transport.on("pause", () => {
            this.pauseSource();
        });

        this.transport.on("start", () => {
            this.startSource();
        });

        this.transport.on("seek", (time) => {
            if (this.isPlaying) {
                this.stopSource();
                this.startSource(time);
            } else {
                this.lastOffset = time;
            }
        });

        this.transport.on("ratechange", () => {
            if (this.isPlaying) {
                // Need to restart the source at the current position with the new rate
                const currentTime = this.transport.seconds;
                this.stopSource();
                this.startSource(currentTime);
            }
        });
    }

    /**
     * Get the audio duration in seconds
     */
    public get duration(): number {
        return this._duration;
    }

    /**
     * Get the current volume (0-1)
     */
    public get volume(): number {
        return this._volume;
    }

    /**
     * Set the current volume (0-1)
     */
    public set volume(value: number) {
        this._volume = Math.max(0, Math.min(1, value));
        this.gainNode.gain.value = this._volume;
    }

    /**
     * Load an audio file from a URL
     * @param url URL of the audio file
     * @returns Promise that resolves when the audio is loaded and decoded
     */
    public async loadAudio(url: string): Promise<AudioBuffer> {
        try {
            // Fetch the audio file
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch audio: ${response.status} ${response.statusText}`,
                );
            }

            // Get the audio data as an ArrayBuffer
            const arrayBuffer = await response.arrayBuffer();

            // Decode the audio data
            const audioBuffer =
                await this.transport.audioContext.decodeAudioData(arrayBuffer);

            // Store the decoded buffer
            this.audioBuffer = audioBuffer;
            this._duration = audioBuffer.duration;
            this.isReady = true;

            return audioBuffer;
        } catch (error) {
            console.error("Error loading audio:", error);
            throw error;
        }
    }

    /**
     * Start playback of the audio source
     * @param offset Time in seconds to start from
     */
    private startSource(offset: number = this.lastOffset): void {
        if (!this.isReady || !this.audioBuffer) return;

        // Create a new source
        this.audioSource = this.transport.audioContext.createBufferSource();
        this.audioSource.buffer = this.audioBuffer;
        this.audioSource.connect(this.gainNode);

        // Set playback rate
        this.audioSource.playbackRate.value = this.transport.playbackRate;

        // Start playback
        this.audioSource.start(0, offset);
        this.isPlaying = true;
        this.lastStartTime = this.transport.audioContext.currentTime;
        this.lastOffset = offset;
    }

    /**
     * Pause the audio source
     */
    private pauseSource(): void {
        if (!this.isPlaying || !this.audioSource) return;

        // Calculate current position
        const elapsed =
            this.transport.audioContext.currentTime - this.lastStartTime;
        this.lastOffset += elapsed * this.transport.playbackRate;

        // Stop the source
        this.audioSource.stop();
        this.audioSource.disconnect();
        this.audioSource = null;
        this.isPlaying = false;
    }

    /**
     * Stop the audio source and reset position
     */
    private stopSource(): void {
        if (!this.audioSource) return;

        // Stop the source
        this.audioSource.stop();
        this.audioSource.disconnect();
        this.audioSource = null;
        this.isPlaying = false;
        this.lastOffset = 0;
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.stopSource();
        if (this.gainNode) {
            this.gainNode.disconnect();
        }
        this.audioBuffer = null;
        this.isReady = false;
    }
}
