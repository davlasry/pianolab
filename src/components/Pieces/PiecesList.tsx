import type { Piece } from "@/types/entities.types.ts";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ItemCard } from "@/components/shared/ItemCard.tsx";

interface Props {
    pieces: Piece[];
    onEdit: (piece: Piece) => void;
    onDelete: (piece: Piece) => void;
}

export const PiecesList = ({ pieces, onEdit, onDelete }: Props) => {
    const navigate = useNavigate();

    const handleEdit = (piece: Piece, e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(piece);
    };

    const handleDelete = (piece: Piece, e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(piece);
    };

    const handlePieceClick = (piece: Piece) => {
        navigate(`/piece/${piece.id}`);
    };

    return (
        <div className="container mx-auto max-w-5xl">
            <div className="grid gap-2">
                {pieces.map((piece) => (
                    <ItemCard
                        key={piece.id}
                        title={piece.name}
                        subtitle={piece.composer || undefined}
                        tags={piece.style ? [{ text: piece.style }] : []}
                        actions={[
                            {
                                icon: <Edit className="h-4 w-4" />,
                                label: "Edit",
                                onClick: (e) => handleEdit(piece, e),
                            },
                            {
                                icon: <Trash2 className="h-4 w-4" />,
                                label: "Delete",
                                onClick: (e) => handleDelete(piece, e),
                            },
                        ]}
                        onClick={() => handlePieceClick(piece)}
                    />
                ))}
            </div>
        </div>
    );
};
