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
    const { uploadFile, isUploading, uploadError, uploadProgress, uploadToS3 } =
        useUploadFile();

    const isLoading = isCreating || isUpdating;
    const error = createError || updateError;

    // Load recording data when in edit mode
    useEffect(() => {
        if (mode === "edit" && recording) {
            setFormData({
                performer: recording.performer || "",
                key: recording.key || "",
            });
        } else {
            // Reset form in create mode
            setFormData({
                performer: "",
                key: "",
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
                bucket: "recordings",
                folder: "audio",
            });
        }

        // Upload midi file if provided
        if (midiFile) {
            midiUrl = await uploadToS3(midiFile);
        }

        const recordingData: Partial<Recording> = {
            performer: formData.performer || null,
            key: formData.key || null,
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
                            </label>
                            <div className="flex flex-col gap-2">
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
                            </label>
                            <div className="flex flex-col gap-2">
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
