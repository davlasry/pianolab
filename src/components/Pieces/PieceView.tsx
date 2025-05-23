import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useFetchPieceDetails } from "@/hooks/useFetchPieceDetails";

export const PieceView = () => {
    const { pieceId } = useParams();
    const { piece, recordings, loading } = useFetchPieceDetails(pieceId);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!piece) {
        return <div>Piece not found</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <Link to="/">
                    <Button variant="ghost" className="pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to pieces
                    </Button>
                </Link>
            </div>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">{piece.name}</h1>
                    <p className="text-gray-600 mt-2">{piece.composer}</p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">Recordings</h2>
                    {recordings.length === 0 ? (
                        <p className="text-gray-500">
                            No recordings yet for this piece.
                        </p>
                    ) : (
                        <div className="grid gap-4">
                            {recordings.map((recording) => (
                                <Link
                                    key={recording.id}
                                    to={`/recording/${recording.id}`}
                                    className="block p-4 rounded-lg border hover:border-primary transition-colors"
                                >
                                    <div className="font-medium">
                                        {recording.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(
                                            recording.created_at || "",
                                        ).toLocaleDateString()}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
