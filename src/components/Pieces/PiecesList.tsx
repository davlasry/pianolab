import type { Piece } from "@/types/entities.types.ts";

interface Props {
    pieces: Piece[];
}

export const PiecesList = ({ pieces }: Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                    <h3 className="font-bold text-lg">{piece.name}</h3>
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
