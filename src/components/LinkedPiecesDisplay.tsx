import { Link } from "react-router-dom";
import { Music } from "lucide-react";
import type { Piece } from "@/types/entities.types";

interface LinkedPiecesDisplayProps {
    pieces: Piece[];
    isLoading: boolean;
}

export const LinkedPiecesDisplay = ({
    pieces,
    isLoading,
}: LinkedPiecesDisplayProps) => {
    if (isLoading) {
        return (
            <div className="px-4 mb-4 text-sm text-gray-500">
                <p>Loading linked pieces...</p>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                <Music className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />{" "}
                Linked Pieces:
            </h3>
            {pieces.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {pieces.map((piece) => (
                        <Link
                            key={piece.id}
                            to={`/piece/${piece.id}`}
                            className="bg-muted hover:bg-muted/80 text-muted-foreground text-xs px-2 py-1 rounded-full shadow-sm cursor-pointer"
                        >
                            {piece.name}
                            {piece.composer && (
                                <span className="ml-1 text-gray-500 dark:text-gray-400">
                                    ({piece.composer})
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">None</p>
            )}
        </div>
    );
};
