import type { Piece } from "@/types/entities.types.ts";
import { Button } from "@/components/ui/button.tsx";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
    pieces: Piece[];
    onEdit: (piece: Piece) => void;
    onDelete: (piece: Piece) => void;
}

export const PiecesList = ({ pieces, onEdit, onDelete }: Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between">
                        <h3 className="font-bold text-lg">{piece.name}</h3>
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="p-1 h-8 w-8"
                                onClick={() => onEdit(piece)}
                                title="Edit piece"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => onDelete(piece)}
                                title="Delete piece"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {piece.composer && (
                        <p className="text-gray-600">
                            Composer: {piece.composer}
                        </p>
                    )}
                    {piece.style && (
                        <p className="text-gray-600">Style: {piece.style}</p>
                    )}
                    {piece.tags && piece.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {piece.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
