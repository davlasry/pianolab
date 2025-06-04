import { useFetchSession } from "@/hooks/queries/useFetchSession.ts";
import { useRef, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMidiNotes } from "@/components/Session/hooks/useMidiNotes.ts";
import type { usePlayer } from "@/components/Session/hooks/usePlayer.ts";

interface Props {
    parseMidi: ReturnType<typeof useMidiNotes>["parseMidi"];
    loadAudio: ReturnType<typeof usePlayer>["loadAudio"];
}

export const useFilesLoader = ({ parseMidi, loadAudio }: Props) => {
    const { sessionId } = useParams();
    const [isReady, setReady] = useState(false);
    const {
        session,
        loading: isLoadingRecording,
        error,
    } = useFetchSession(sessionId);

    // Track if we've already loaded assets for this session
    const assetsLoadedForIdRef = useRef<string | null>(null);

    // Memoize the loadMidi function to maintain a stable reference
    const loadMidi = useCallback(
        (url?: string) => {
            return parseMidi(url);
        },
        [parseMidi],
    );

    useEffect(() => {
        // Skip if session is not loaded yet
        if (!session) return;

        // Skip if we've already loaded assets for this session
        if (assetsLoadedForIdRef.current === session.id) return;

        let isMounted = true;

        const loadAssets = async () => {
            try {
                // Prepare URLs or use null values if not available
                const audioUrl = session.audio_url || undefined;
                const midiUrl = session.midi_url || undefined;

                // Load MIDI first, then audio (not in parallel to avoid race conditions)
                if (midiUrl) {
                    await loadMidi(midiUrl);
                }

                if (audioUrl) {
                    await loadAudio(audioUrl);
                }

                if (isMounted) {
                    assetsLoadedForIdRef.current = session.id;
                    setReady(true);
                }
            } catch (error) {
                console.error("Failed to load assets:", error);
            }
        };

        loadAssets();

        return () => {
            isMounted = false;
        };
    }, [session, loadMidi, loadAudio]);

    return {
        isLoadingRecording,
        error,
        loadAudio,
        loadMidi,
        isReady,
        session,
    };
};
