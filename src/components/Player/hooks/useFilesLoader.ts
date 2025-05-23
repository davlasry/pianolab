import { useFetchRecording } from "@/hooks/queries/useFetchRecording.ts";
import { useRef, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMidiNotes } from "@/components/Player/hooks/useMidiNotes.ts";
import type { usePlayer } from "@/components/Player/hooks/usePlayer.ts";

interface Props {
    parseMidi: ReturnType<typeof useMidiNotes>["parseMidi"];
    loadAudio: ReturnType<typeof usePlayer>["loadAudio"];
}

export const useFilesLoader = ({ parseMidi, loadAudio }: Props) => {
    const { recordingId } = useParams();
    const [isReady, setReady] = useState(false);
    const {
        recording,
        loading: isLoadingRecording,
        error,
    } = useFetchRecording(recordingId);

    // Track if we've already loaded assets for this recording
    const assetsLoadedForIdRef = useRef<string | null>(null);

    // Memoize the loadMidi function to maintain a stable reference
    const loadMidi = useCallback(
        (url?: string) => {
            return parseMidi(url);
        },
        [parseMidi],
    );

    useEffect(() => {
        // Skip if recording is not loaded yet
        if (!recording) return;

        // Skip if we've already loaded assets for this recording
        if (assetsLoadedForIdRef.current === recording.id) return;

        let isMounted = true;
        console.log("Loading assets for recording:", recording.id);

        const loadAssets = async () => {
            try {
                // Prepare URLs or use null values if not available
                const audioUrl = recording.audio_url || undefined;
                const midiUrl = recording.midi_url || undefined;

                console.log("Audio URL:", audioUrl);
                console.log("MIDI URL:", midiUrl);

                // Load MIDI first, then audio (not in parallel to avoid race conditions)
                if (midiUrl) {
                    await loadMidi(midiUrl);
                }

                if (audioUrl) {
                    await loadAudio(audioUrl);
                }

                if (isMounted) {
                    assetsLoadedForIdRef.current = recording.id;
                    setReady(true);
                    console.log(
                        "Assets loaded successfully for recording:",
                        recording.id,
                    );
                }
            } catch (error) {
                console.error("Failed to load assets:", error);
            }
        };

        loadAssets();

        return () => {
            isMounted = false;
        };
    }, [recording, loadMidi, loadAudio]);

    return {
        isLoadingRecording,
        error,
        loadAudio,
        loadMidi,
        isReady,
        recording,
    };
};
