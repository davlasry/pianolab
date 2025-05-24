import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useCreateRecording } from "@/hooks/queries/useCreateRecording.ts";
import { useUpdateSession } from "@/hooks/queries/useUpdateSession.ts";
import { useUploadFile } from "@/hooks/queries/useUploadFile.ts";
import type { InsertRecording, Recording } from "@/types/entities.types.ts";
import { useFetchPieces } from "@/hooks/queries/useFetchPieces.ts";
import { supabase } from "@/supabase.ts";
import { MultiSelect } from "@/components/ui/multi-select";

interface RecordingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    session?: Recording; // For edit mode
    mode: "create" | "edit";
}

export const RecordingFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    session,
    mode = "create",
}: RecordingFormModalProps) => {
    const [formData, setFormData] = useState<
        Partial<InsertRecording> & { piece_ids?: string[] }
    >({
        performer: "",
        key: "",
        name: "",
        audio_url: "",
        midi_url: "",
        piece_ids: [],
    });
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [midiFile, setMidiFile] = useState<File | null>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const midiInputRef = useRef<HTMLInputElement>(null);

    const {
        createRecording,
        isLoading: isCreating,
        error: createError,
    } = useCreateRecording();
    const {
        updateRecording,
        isLoading: isUpdating,
        error: updateError,
    } = useUpdateSession();
    const { uploadFile, isUploading, uploadError, uploadProgress } =
        useUploadFile();

    const { pieces, loading: piecesLoading } = useFetchPieces();

    const isLoading = isCreating || isUpdating;
    const error = createError || updateError;

    // Load session data when in edit mode
    useEffect(() => {
        if (mode === "edit" && session) {
            setFormData({
                performer: session.performer || "",
                key: session.key || "",
                name: session.name || "",
                audio_url: session.audio_url || "",
                midi_url: session.midi_url || "",
                piece_ids: [], // Initialize as empty, will be populated by fetchAssociatedPieces
            });
            // Fetch associated pieces for the session in edit mode
            const fetchAssociatedPieces = async () => {
                if (session?.id) {
                    const { data, error: fetchError } = await supabase
                        .from("session_pieces")
                        .select("piece_id")
                        .eq("session_id", session.id);
                    if (fetchError) {
                        console.error(
                            "Error fetching associated pieces:",
                            fetchError,
                        );
                    } else {
                        setFormData((prev) => ({
                            ...prev,
                            piece_ids: data.map((rp) => rp.piece_id),
                        }));
                    }
                }
            };
            fetchAssociatedPieces();
        } else {
            // Reset form in create mode
            setFormData({
                performer: "",
                key: "",
                name: "",
                audio_url: "",
                midi_url: "",
                piece_ids: [],
            });
        }
    }, [mode, session]);

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData(
            (prev: Partial<InsertRecording> & { piece_ids?: string[] }) => ({
                ...prev,
                [name]: value,
            }),
        );
    };

    const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAudioFile(e.target.files[0]);
        }
    };

    const handleMidiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setMidiFile(e.target.files[0]);
        }
    };

    const handleClearAudioFile = () => {
        setAudioFile(null);
        if (audioInputRef.current) {
            audioInputRef.current.value = "";
        }
    };

    const handleClearMidiFile = () => {
        setMidiFile(null);
        if (midiInputRef.current) {
            midiInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let audioUrl = formData.audio_url;
        let midiUrl = formData.midi_url;

        // Upload audio file if provided
        if (audioFile) {
            audioUrl = await uploadFile({
                file: audioFile,
                fileType: "audio",
            });
        } else if (mode === "edit" && session) {
            // Preserve existing audio URL in edit mode if no new file provided
            audioUrl = session.audio_url;
        }

        // Upload midi file if provided
        if (midiFile) {
            midiUrl = await uploadFile({
                file: midiFile,
                fileType: "midi",
            });
        } else if (mode === "edit" && session) {
            // Preserve existing MIDI URL in edit mode if no new file provided
            midiUrl = session.midi_url;
        }

        const sessionData: Partial<Recording> = {
            performer: formData.performer || null,
            key: formData.key || null,
            name: formData.name || null,
            audio_url: audioUrl || null,
            midi_url: midiUrl || null,
        };

        let result;
        let sessionIdToLink = "";

        if (mode === "edit" && session) {
            result = await updateRecording(session.id, sessionData);
            if (result) sessionIdToLink = result.id;
        } else {
            result = await createRecording(sessionData as InsertRecording);
            if (result) sessionIdToLink = result.id;
        }

        if (result && sessionIdToLink) {
            // Handle piece linking
            // 1. Delete existing links for this session (important for edit mode)
            const { error: deleteError } = await supabase
                .from("session_pieces")
                .delete()
                .eq("session_id", sessionIdToLink);

            if (deleteError) {
                console.error(
                    "Error deleting existing piece links:",
                    deleteError,
                );
                // Optionally, set an error state here to inform the user and potentially stop execution
                // For now, we'll proceed to attempt inserting new links
            }

            // 2. Insert new links
            if (formData.piece_ids && formData.piece_ids.length > 0) {
                const linksToInsert = formData.piece_ids.map((piece_id) => ({
                    session_id: sessionIdToLink,
                    piece_id: piece_id,
                }));
                const { error: linkError } = await supabase
                    .from("session_pieces")
                    .insert(linksToInsert);
                if (linkError) {
                    console.error("Error linking pieces:", linkError);
                    // Optionally, set an error state here to inform the user
                }
            }

            setFormData({
                performer: "",
                key: "",
                name: "",
                audio_url: "",
                midi_url: "",
                piece_ids: [],
            });
            setAudioFile(null);
            setMidiFile(null);
            onSuccess?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    {mode === "edit" ? "Edit Recording" : "Add New Recording"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="text-left">
                            <label
                                htmlFor="performer"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Performer
                            </label>
                            <input
                                id="performer"
                                name="performer"
                                type="text"
                                value={formData.performer || ""}
                                onChange={handleChange}
                                className="w-full p-2 border rounded bg-input text-foreground"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Recording Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name || ""}
                                onChange={handleChange}
                                className="w-full p-2 border rounded bg-input text-foreground"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="key"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Key
                            </label>
                            <input
                                id="key"
                                name="key"
                                type="text"
                                value={formData.key || ""}
                                onChange={handleChange}
                                className="w-full p-2 border rounded bg-input text-foreground"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="pieces"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Linked Pieces
                            </label>
                            <MultiSelect
                                options={pieces.map((p) => ({
                                    value: p.id,
                                    label: `${p.name}${p.composer ? ` by ${p.composer}` : ""}`,
                                }))}
                                defaultValue={formData.piece_ids || []}
                                onValueChange={(selected: string[]) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        piece_ids: selected,
                                    }))
                                }
                                placeholder="Select pieces..."
                                disabled={piecesLoading}
                                className="w-full bg-input text-foreground"
                            />
                            {piecesLoading && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Loading pieces...
                                </p>
                            )}
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="audio_file"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Audio File
                                {mode === "edit" && session?.audio_url && (
                                    <Badge variant="success" className="ml-2">
                                        File Attached
                                    </Badge>
                                )}
                            </label>
                            <div className="flex flex-col gap-2">
                                {mode === "edit" &&
                                    session?.audio_url &&
                                    !audioFile && (
                                        <div className="flex flex-col p-3 rounded mb-2">
                                            <Badge
                                                variant="success"
                                                className="w-fit"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 mr-2"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 4a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z"
                                                        clipRule="evenodd"
                                                    />
                                                    <path d="M8 8.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5zM8 10.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5z" />
                                                </svg>
                                                This session has an audio file
                                            </Badge>
                                            <div className="mt-2 flex justify-between items-center">
                                                <a
                                                    href={session.audio_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-primary/90 underline flex items-center"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 mr-1"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000-16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Listen to current audio
                                                </a>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Upload a new file below to
                                                replace the existing one
                                            </p>
                                        </div>
                                    )}
                                <input
                                    id="audio_file"
                                    type="file"
                                    ref={audioInputRef}
                                    accept="audio/*"
                                    onChange={handleAudioFileChange}
                                    className="w-full p-2 border rounded bg-input text-foreground"
                                />
                                {audioFile && (
                                    <Badge
                                        variant="info"
                                        className="w-full justify-between"
                                    >
                                        <span className="text-sm truncate">
                                            {audioFile.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleClearAudioFile}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="midi_file"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                MIDI File
                                {mode === "edit" && session?.midi_url && (
                                    <Badge variant="success" className="ml-2">
                                        File Attached
                                    </Badge>
                                )}
                            </label>
                            <div className="flex flex-col gap-2">
                                {mode === "edit" &&
                                    session?.midi_url &&
                                    !midiFile && (
                                        <div className="flex flex-col p-3 rounded mb-2">
                                            <Badge
                                                variant="success"
                                                className="w-fit"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 mr-2"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                                                        clipRule="evenodd"
                                                    />
                                                    <path d="M8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" />
                                                </svg>
                                                This session has a MIDI file
                                            </Badge>
                                            <div className="mt-2 flex justify-between items-center">
                                                <a
                                                    href={session.midi_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-primary/90 underline flex items-center"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 mr-1"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Download current MIDI
                                                </a>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Upload a new file below to
                                                replace the existing one
                                            </p>
                                        </div>
                                    )}
                                <input
                                    id="midi_file"
                                    type="file"
                                    ref={midiInputRef}
                                    accept=".mid,.midi"
                                    onChange={handleMidiFileChange}
                                    className="w-full p-2 border rounded bg-input text-foreground"
                                />
                                {midiFile && (
                                    <Badge
                                        variant="info"
                                        className="w-full justify-between"
                                    >
                                        <span className="text-sm truncate">
                                            {midiFile.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleClearMidiFile}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {isUploading && (
                            <div className="mt-4 mb-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-center mt-1">
                                    Uploading... {Math.round(uploadProgress)}%
                                </p>
                                <p className="text-xs text-center text-muted-foreground mt-1">
                                    Please wait while your files are being
                                    uploaded
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="text-destructive text-sm mt-2">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || isUploading}
                            >
                                {isLoading || isUploading
                                    ? "Saving..."
                                    : "Save"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
