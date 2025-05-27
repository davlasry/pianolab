import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { ArrowLeft, Calendar, Music2, Tag } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useFetchPieceDetails } from "@/hooks/queries/useFetchPieceDetails.ts";
import { ItemCard } from "@/components/shared/ItemCard.tsx";

export const PieceView = () => {
    const { pieceId } = useParams();
    const navigate = useNavigate();
    const { piece, sessions, loading } = useFetchPieceDetails(pieceId);

    if (loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (!piece) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-gray-500">Piece not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <Link to="/">
                    <Button variant="ghost" className="pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to pieces
                    </Button>
                </Link>
            </div>

            <div className="space-y-8">
                {/* Piece Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white">
                        {piece.name}
                    </h1>
                    {piece.composer && (
                        <div className="flex items-center text-lg text-zinc-200">
                            <Music2 className="mr-2 h-5 w-5" />
                            {piece.composer}
                        </div>
                    )}
                </div>

                {/* Piece Details */}
                <Card className="bg-zinc-900/50 p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {piece.style && (
                            <div className="flex items-center">
                                <Tag className="mr-2 h-5 w-5 text-zinc-400" />
                                <div>
                                    <div className="text-sm text-zinc-400">
                                        Style
                                    </div>
                                    <div className="text-zinc-100">
                                        {piece.style}
                                    </div>
                                </div>
                            </div>
                        )}
                        {piece.created_at && (
                            <div className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-zinc-400" />
                                <div>
                                    <div className="text-sm text-zinc-400">
                                        Added on
                                    </div>
                                    <div className="text-zinc-100">
                                        {new Date(
                                            piece.created_at,
                                        ).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                        {piece.tags && piece.tags.length > 0 && (
                            <div className="col-span-2 flex items-center">
                                <div className="flex flex-wrap gap-2">
                                    {piece.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="rounded-md bg-zinc-800 px-2 py-1 text-sm text-zinc-200"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Sessions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-white">
                            Sessions
                        </h2>
                        <div className="text-sm text-zinc-400">
                            {sessions.length}{" "}
                            {sessions.length === 1 ? "session" : "sessions"}
                        </div>
                    </div>

                    {sessions.length === 0 ? (
                        <Card className="bg-zinc-900/50 p-6 text-center text-zinc-300">
                            No sessions yet for this piece.
                        </Card>
                    ) : (
                        <div className="grid gap-2">
                            {sessions.map((session) => (
                                <ItemCard
                                    key={session.id}
                                    title={session.name || "Untitled"}
                                    subtitle={
                                        session.performer
                                            ? `Performed by ${session.performer}`
                                            : undefined
                                    }
                                    tags={
                                        session.key
                                            ? [{ text: session.key }]
                                            : []
                                    }
                                    centerContent={
                                        <div className="text-sm text-zinc-400">
                                            {new Date(
                                                session.created_at || "",
                                            ).toLocaleDateString()}
                                        </div>
                                    }
                                    actions={[]}
                                    onClick={() =>
                                        navigate(`/session/${session.id}`)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
