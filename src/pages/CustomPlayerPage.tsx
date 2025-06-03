import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useFetchSession } from "@/hooks/queries/useFetchSession";
import { CustomPlayerComponent } from "@/components/Player/CustomPlayerComponent";
import type { Chord } from "@/lib/CustomPlayer";

export default function CustomPlayerPage() {
    const { sessionId } = useParams();
    const { session, loading, error } = useFetchSession(sessionId);
    const [chords, setChords] = useState<Chord[]>([]);

    useEffect(() => {
        // Load chord progression if available
        if (session?.chords) {
            try {
                // Assume chords is already a JSON object or can be parsed if it's a string
                const chordsData =
                    typeof session.chords === "string"
                        ? JSON.parse(session.chords)
                        : session.chords;

                setChords(chordsData as Chord[]);
            } catch (err) {
                console.error("Error parsing chords:", err);
            }
        }
    }, [session]);

    if (loading) {
        return (
            <div className="container flex min-h-[50vh] items-center justify-center">
                <div className="text-lg">Loading session...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container flex min-h-[50vh] flex-col items-center justify-center space-y-4">
                <div className="text-lg text-red-500">
                    {error || "Error loading session"}
                </div>
                <Button asChild variant="outline">
                    <Link to="/sessions">Back to Sessions</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <Link to={session ? `/session/${sessionId}` : "/sessions"}>
                    <Button variant="ghost" className="pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {session ? "Back to ToneJS Player" : "Back to Sessions"}
                    </Button>
                </Link>
            </div>

            <div className="space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold">
                        {session?.name || "Custom Player"}
                    </h1>
                    <p className="text-muted-foreground">
                        This player uses Web Audio API and WebMIDI.js instead of
                        ToneJS, allowing for synchronized variable-speed
                        playback of audio and MIDI.
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    {session ? (
                        <CustomPlayerComponent
                            audioUrl={
                                session.audio_url ||
                                "/pianolab/body_and_soul.mp3"
                            }
                            midiUrl={session.midi_url || "/pianolab/sample.mid"}
                            chordProgression={chords}
                        />
                    ) : (
                        <div className="p-4 text-center text-muted-foreground">
                            <p>Session not found or failed to load</p>
                            <p className="mt-2 text-sm">
                                Try a different session or check that your media
                                files are accessible
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
