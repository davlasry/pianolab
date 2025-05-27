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
            <div className="mb-4 px-4 text-sm text-gray-500">
                <p>Loading linked pieces...</p>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <h3 className="mb-1 flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                <Music className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />{" "}
                Linked Pieces:
            </h3>
            {pieces.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {pieces.map((piece) => (
                        <Link
                            key={piece.id}
                            to={`/piece/${piece.id}`}
                            className="cursor-pointer rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground shadow-sm hover:bg-muted/80"
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
