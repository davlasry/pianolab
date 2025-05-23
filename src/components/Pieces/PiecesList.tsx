import type { Piece } from "@/types/entities.types.ts";
import { Button } from "@/components/ui/button.tsx";
import { Edit, Trash2, Music } from "lucide-react";
import { Card } from "@/components/ui/card.tsx";
import { useNavigate } from "react-router-dom";

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
                    <Card
                        key={piece.id}
                        className="overflow-hidden border-0 bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 cursor-pointer py-4 px-0"
                        onClick={() => handlePieceClick(piece)}
                    >
                        <div className="flex items-center px-4">
                            <div className="h-12 w-12 rounded-md bg-zinc-800 flex items-center justify-center mr-4">
                                <Music className="h-6 w-6 text-zinc-400" />
                            </div>

                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-4">
                                <div className="col-span-2 md:col-span-1">
                                    <h3 className="font-medium text-base text-white line-clamp-1">
                                        {piece.name}
                                    </h3>
                                    {piece.composer && (
                                        <p className="text-sm text-zinc-400 line-clamp-1">
                                            {piece.composer}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center text-sm text-zinc-400">
                                    {/* Placeholder for potential future elements like length/duration */}
                                </div>

                                <div className="text-sm">
                                    {piece.style && (
                                        <span className="inline-block px-2 py-0.5 bg-zinc-800 rounded-sm text-zinc-400 text-xs">
                                            {piece.style}
                                        </span>
                                    )}
                                    {/* Consider if 'key' is relevant for pieces or if tags should be displayed differently */}
                                    {/* {piece.tags && piece.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {piece.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block px-2 py-0.5 bg-zinc-700 rounded-sm text-zinc-300 text-xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )} */}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Add Play button if applicable for pieces, otherwise remove */}
                                {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    // onClick={(e) => { e.stopPropagation(); onOpenPiece(piece); }} // Define onOpenPiece if needed
                                    className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-400 text-black hover:scale-105 transition-all"
                                >
                                    <Play className="h-4 w-4 ml-0.5" />
                                    <span className="sr-only">Play</span>
                                </Button> */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleEdit(piece, e)}
                                    className="h-8 w-8 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-all"
                                    title="Edit piece"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleDelete(piece, e)}
                                    className="h-8 w-8 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-all"
                                    title="Delete piece"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
