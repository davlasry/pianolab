import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useCreatePiece } from "@/hooks/useCreatePiece.ts";
import type { InsertPiece } from "@/types/entities.types.ts";

interface PieceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const PieceFormModal = ({
    isOpen,
    onClose,
    onSuccess,
}: PieceFormModalProps) => {
    const [formData, setFormData] = useState<Partial<InsertPiece>>({
        name: "",
        composer: "",
        style: "",
        tags: [],
        audio_url: "",
        midi_url: "",
    });
    const [tagInput, setTagInput] = useState("");
    const { createPiece, isLoading, error } = useCreatePiece();

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddTag = () => {
        if (tagInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()],
            }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            return; // Name is required
        }

        const piece: InsertPiece = {
            name: formData.name,
            composer: formData.composer || null,
            style: formData.style || null,
            tags: formData.tags || null,
            audio_url: formData.audio_url || null,
            midi_url: formData.midi_url || null,
        };

        const result = await createPiece(piece);

        if (result) {
            setFormData({
                name: "",
                composer: "",
                style: "",
                tags: [],
                audio_url: "",
                midi_url: "",
            });
            onSuccess?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-gray-800 dark:text-gray-300">
                <h2 className="text-xl font-bold mb-4">Add New Piece</h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="text-left">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="composer"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Composer
                            </label>
                            <input
                                id="composer"
                                name="composer"
                                type="text"
                                value={formData.composer || ""}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="style"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Style
                            </label>
                            <input
                                id="style"
                                name="style"
                                type="text"
                                value={formData.style || ""}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="tags"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Tags
                            </label>
                            <div className="flex">
                                <input
                                    id="tags"
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) =>
                                        setTagInput(e.target.value)
                                    }
                                    className="flex-1 p-2 border rounded-l dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Add a tag"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
                                >
                                    Add
                                </button>
                            </div>

                            {formData.tags && formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map((tag, index) => (
                                        <div
                                            key={index}
                                            className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded flex items-center"
                                        >
                                            <span>{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveTag(tag)
                                                }
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="audio_url"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Audio URL
                            </label>
                            <input
                                id="audio_url"
                                name="audio_url"
                                type="text"
                                value={formData.audio_url || ""}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                placeholder="https://example.com/audio.mp3"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="midi_url"
                                className="block text-sm font-medium mb-1 text-left"
                            >
                                Midi URL
                            </label>
                            <input
                                id="midi_url"
                                name="midi_url"
                                type="text"
                                value={formData.midi_url || ""}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                placeholder="https://example.com/file.mid"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                                className="bg-gray-400 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !formData.name}
                            >
                                {isLoading ? "Saving..." : "Save Piece"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
