import { useState } from "react";
import { useFetchPieces } from "@/hooks/queries/useFetchPieces.ts";
import { useDeletePiece } from "@/hooks/queries/useDeletePiece.ts";
import { PieceFormModal } from "@/components/Pieces/PieceFormModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import { PiecesList } from "@/components/Pieces/PiecesList.tsx";
import type { Piece } from "@/types/entities.types.ts";
import { Plus } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";

export const Pieces = () => {
    const { pieces, loading, refresh } = useFetchPieces();
    const { deletePiece, isLoading: isDeleting } = useDeletePiece();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedPiece, setSelectedPiece] = useState<Piece | undefined>(
        undefined,
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pieceToDelete, setPieceToDelete] = useState<Piece | null>(null);

    const openCreateModal = () => {
        setModalMode("create");
        setSelectedPiece(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (piece: Piece) => {
        setModalMode("edit");
        setSelectedPiece(piece);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleDeletePiece = (piece: Piece) => {
        setPieceToDelete(piece);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (pieceToDelete) {
            const success = await deletePiece(pieceToDelete.id);
            if (success) {
                refresh();
            }
        }
        setDeleteDialogOpen(false);
        setPieceToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setPieceToDelete(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Pieces</h2>
                <Button
                    onClick={openCreateModal}
                    size="icon"
                    variant="secondary"
                    className="hover:scale-105 transition-transform"
                >
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">Add Piece</span>
                </Button>
            </div>
            {loading ? (
                <p>Loading pieces...</p>
            ) : pieces.length === 0 ? (
                <p className="text-gray-500">
                    No pieces found. Create your first piece!
                </p>
            ) : (
                <PiecesList
                    pieces={pieces}
                    onEdit={openEditModal}
                    onDelete={handleDeletePiece}
                />
            )}

            <PieceFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={refresh}
                piece={selectedPiece}
                mode={modalMode}
            />

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the piece "
                            {pieceToDelete?.name}". This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={cancelDelete}
                            disabled={isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
