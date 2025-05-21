import { useState } from "react";
import { useFetchPieces } from "@/hooks/useFetchPieces.ts";
import { PieceFormModal } from "@/components/Pieces/PieceFormModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import { PiecesList } from "@/components/Pieces/PiecesList.tsx";

export const Pieces = () => {
    const { pieces, loading, refresh } = useFetchPieces();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Pieces</h2>
                <Button onClick={openModal}>Add Piece</Button>
            </div>

            {loading ? (
                <p>Loading pieces...</p>
            ) : pieces.length === 0 ? (
                <p className="text-gray-500">
                    No pieces found. Create your first piece!
                </p>
            ) : (
                <PiecesList pieces={pieces} />
            )}

            <PieceFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={refresh}
            />
        </div>
    );
};
