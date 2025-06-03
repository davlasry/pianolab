import { useState } from "react";
import { useFetchPieces } from "@/hooks/queries/useFetchPieces.ts";
import { useDeletePiece } from "@/hooks/queries/useDeletePiece.ts";
import { PieceFormModal } from "@/components/Pieces/PieceFormModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { Piece } from "@/types/entities.types.ts";
import { Plus, Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PiecesTable } from "@/components/Pieces/PiecesTable.tsx";
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
    const navigate = useNavigate();
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

    const handlePieceClick = (piece: Piece) => {
        navigate(`/piece/${piece.id}`);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Music2 className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Pieces</h1>
                </div>
                <Button
                    onClick={openCreateModal}
                    variant="default"
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    New Piece
                </Button>
            </div>

            <div className="rounded-lg border bg-card p-0 shadow-sm">
                {loading ? (
                    <div className="flex h-[300px] items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground">Loading pieces...</p>
                        </div>
                    </div>
                ) : pieces.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Music2 className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">No pieces yet</h3>
                            <p className="text-muted-foreground">
                                Create your first piece to get started
                            </p>
                        </div>
                        <Button onClick={openCreateModal} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Piece
                        </Button>
                    </div>
                ) : (
                    <PiecesTable
                        pieces={pieces}
                        onOpenPiece={handlePieceClick}
                        onEdit={openEditModal}
                        onDelete={handleDeletePiece}
                    />
                )}
            </div>

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
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
