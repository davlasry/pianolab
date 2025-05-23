import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useCreateRecording } from "@/hooks/useCreateRecording.ts";
import { useUpdateRecording } from "@/hooks/useUpdateRecording.ts";
import { useUploadFile } from "@/hooks/useUploadFile.ts";
import type { InsertRecording, Recording } from "@/types/entities.types.ts";

interface RecordingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    recording?: Recording; // For edit mode
    mode: "create" | "edit";
}

export const RecordingFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    recording,
    mode = "create",
}: RecordingFormModalProps) => {
    const [formData, setFormData] = useState<Partial<InsertRecording>>({
        performer: "",
        key: "",
        name: "",
        audio_url: "",
        midi_url: "",
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
    } = useUpdateRecording();
    const { uploadFile, isUploading, uploadError, uploadProgress } =
        useUploadFile();

    const isLoading = isCreating || isUpdating;
    const error = createError || updateError;

    // Load recording data when in edit mode
    useEffect(() => {
        if (mode === "edit" && recording) {
            setFormData({
                performer: recording.performer || "",
                key: recording.key || "",
                name: recording.name || "",
                audio_url: recording.audio_url || "",
                midi_url: recording.midi_url || "",
            });
        } else {
            // Reset form in create mode
            setFormData({
                performer: "",
                key: "",
                name: "",
                audio_url: "",
                midi_url: "",
            });
        }
    }, [mode, recording]);

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev: Partial<InsertRecording>) => ({
            ...prev,
            [name]: value,
        }));
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
        } else if (mode === "edit" && recording) {
            // Preserve existing audio URL in edit mode if no new file provided
            audioUrl = recording.audio_url;
        }

        // Upload midi file if provided
        if (midiFile) {
            midiUrl = await uploadFile({
                file: midiFile,
                fileType: "midi",
            });
        } else if (mode === "edit" && recording) {
            // Preserve existing MIDI URL in edit mode if no new file provided
            midiUrl = recording.midi_url;
        }

        const recordingData: Partial<Recording> = {
            performer: formData.performer || null,
            key: formData.key || null,
            name: formData.name || null,
            audio_url: audioUrl || null,
            midi_url: midiUrl || null,
        };

        let result;

        if (mode === "edit" && recording) {
            result = await updateRecording(recording.id, recordingData);
        } else {
            result = await createRecording(recordingData as InsertRecording);
        }

        if (result) {
            setFormData({
                performer: "",
                key: "",
                name: "",
                audio_url: "",
                midi_url: "",
            });
            setAudioFile(null);
            setMidiFile(null);
            onSuccess?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-gray-800 dark:text-gray-300">
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
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="audio_file"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Audio File
                                {mode === "edit" && recording?.audio_url && (
                                    <span className="ml-2 text-xs text-green-600 font-semibold dark:text-green-400">
                                        (File Attached)
                                    </span>
                                )}
                            </label>
                            <div className="flex flex-col gap-2">
                                {mode === "edit" &&
                                    recording?.audio_url &&
                                    !audioFile && (
                                        <div className="flex flex-col bg-green-50 dark:bg-green-900/40 p-3 rounded mb-2 border border-green-200 dark:border-green-800">
                                            <div className="flex items-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-green-600 dark:text-green-400 mr-2"
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
                                                <span className="font-medium text-green-700 dark:text-green-300">
                                                    This recording has an audio
                                                    file
                                                </span>
                                            </div>
                                            <div className="mt-2 flex justify-between items-center">
                                                <a
                                                    href={recording.audio_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-700 underline flex items-center"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 mr-1"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Listen to current audio
                                                </a>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
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
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                                {audioFile && (
                                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 p-2 rounded">
                                        <span className="text-sm truncate">
                                            {audioFile.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleClearAudioFile}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="midi_file"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                MIDI File
                                {mode === "edit" && recording?.midi_url && (
                                    <span className="ml-2 text-xs text-green-600 font-semibold dark:text-green-400">
                                        (File Attached)
                                    </span>
                                )}
                            </label>
                            <div className="flex flex-col gap-2">
                                {mode === "edit" &&
                                    recording?.midi_url &&
                                    !midiFile && (
                                        <div className="flex flex-col bg-green-50 dark:bg-green-900/40 p-3 rounded mb-2 border border-green-200 dark:border-green-800">
                                            <div className="flex items-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-green-600 dark:text-green-400 mr-2"
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
                                                <span className="font-medium text-green-700 dark:text-green-300">
                                                    This recording has a MIDI
                                                    file
                                                </span>
                                            </div>
                                            <div className="mt-2 flex justify-between items-center">
                                                <a
                                                    href={recording.midi_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-700 underline flex items-center"
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
                                            <p className="text-xs text-gray-500 mt-2">
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
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                                {midiFile && (
                                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 p-2 rounded">
                                        <span className="text-sm truncate">
                                            {midiFile.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleClearMidiFile}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isUploading && (
                            <div className="mt-4 mb-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-center mt-1">
                                    Uploading... {Math.round(uploadProgress)}%
                                </p>
                                <p className="text-xs text-center text-gray-500 mt-1">
                                    Please wait while your files are being
                                    uploaded
                                </p>
                            </div>
                        )}

                        {(error || uploadError) && (
                            <div className="text-red-500 text-sm">
                                {error || uploadError}
                            </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading || isUploading}
                                className="bg-gray-400 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || isUploading}
                            >
                                {isLoading || isUploading
                                    ? "Saving..."
                                    : mode === "edit"
                                      ? "Save Changes"
                                      : "Save Recording"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
