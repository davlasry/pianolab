import { useState, useEffect } from "react";
import { useCreatePiece } from "@/hooks/queries/useCreatePiece.ts";
import { useUpdatePiece } from "@/hooks/queries/useUpdatePiece.ts";
import type { InsertPiece, Piece } from "@/types/entities.types.ts";

interface PieceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    piece?: Piece; // For edit mode
    mode: "create" | "edit";
}

export const PieceFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    piece,
    mode = "create",
}: PieceFormModalProps) => {
    const [formData, setFormData] = useState<Partial<InsertPiece>>({
        name: "",
        composer: "",
        style: "",
        tags: [],
    });
    const [tagInput, setTagInput] = useState("");

    const {
        createPiece,
        isLoading: isCreating,
        error: createError,
    } = useCreatePiece();
    const {
        updatePiece,
        isLoading: isUpdating,
        error: updateError,
    } = useUpdatePiece();

    const isLoading = isCreating || isUpdating;
    const error = createError || updateError;

    // Load piece data when in edit mode
    useEffect(() => {
        if (mode === "edit" && piece) {
            setFormData({
                name: piece.name || "",
                composer: piece.composer || "",
                style: piece.style || "",
                tags: piece.tags || [],
            });
        } else {
            // Reset form in create mode
            setFormData({
                name: "",
                composer: "",
                style: "",
                tags: [],
            });
        }
    }, [mode, piece]);

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev: Partial<InsertPiece>) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim()) {
            setFormData((prev: Partial<InsertPiece>) => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()],
            }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData((prev: Partial<InsertPiece>) => ({
            ...prev,
            tags: (prev.tags || []).filter(
                (tag: string) => tag !== tagToRemove,
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            return; // Name is required
        }

        const pieceData: Partial<Piece> = {
            name: formData.name,
            composer: formData.composer || null,
            style: formData.style || null,
            tags: formData.tags || null,
        };

        let result;

        if (mode === "edit" && piece) {
            result = await updatePiece(piece.id, pieceData);
        } else {
            result = await createPiece(pieceData as InsertPiece);
        }

        if (result) {
            setFormData({
                name: "",
                composer: "",
                style: "",
                tags: [],
            });
            onSuccess?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-background p-6 text-foreground shadow-lg">
                <h2 className="mb-4 text-xl font-bold">
                    {mode === "edit" ? "Edit Piece" : "Add New Piece"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="text-left">
                            <label
                                htmlFor="name"
                                className="mb-1 block text-left text-sm font-medium"
                            >
                                Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded border bg-input p-2 text-foreground"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="composer"
                                className="mb-1 block text-left text-sm font-medium"
                            >
                                Composer
                            </label>
                            <input
                                id="composer"
                                name="composer"
                                type="text"
                                value={formData.composer || ""}
                                onChange={handleChange}
                                className="w-full rounded border bg-input p-2 text-foreground"
                            />
                        </div>

                        <div className="text-left">
                            <label
                                htmlFor="style"
                                className="mb-1 block text-left text-sm font-medium"
                            >
                                Style
                            </label>
                            <input
                                id="style"
                                name="style"
                                type="text"
                                value={formData.style || ""}
                                onChange={handleChange}
                                className="w-full rounded border bg-input p-2 text-foreground"
                            />
                        </div>

                        <div className="text-left">
                            <label className="mb-1 block text-left text-sm font-medium">
                                Tags
                            </label>
                            <div className="mb-2 flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) =>
                                        setTagInput(e.target.value)
                                    }
                                    className="flex-1 rounded-l border bg-input p-2 text-foreground"
                                    placeholder="Add a tag"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="rounded-r bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags?.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center rounded bg-accent px-2 py-1 text-accent-foreground"
                                    >
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-2 text-accent-foreground/70 hover:text-accent-foreground"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="rounded bg-muted px-4 py-2 text-muted-foreground hover:bg-muted/90"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                            {isLoading
                                ? "Saving..."
                                : mode === "edit"
                                  ? "Save Changes"
                                  : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
