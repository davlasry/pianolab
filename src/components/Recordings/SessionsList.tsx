import { Clock, Edit, Trash2, Plus } from "lucide-react";
import type { Recording, Piece } from "@/types/entities.types.ts";
import { ItemCard } from "@/components/shared/ItemCard.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip.tsx";
import { useFetchSessions } from "@/hooks/queries/useFetchSessions.ts";

function PiecesList({ pieces }: { pieces: Piece[] }) {
    const maxVisible = 1;
    const visiblePieces = pieces.slice(0, maxVisible);
    const remainingCount = pieces.length - maxVisible;

    if (pieces.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {visiblePieces.map((piece) => (
                <Badge
                    key={piece.id}
                    variant="secondary"
                    className="text-xs bg-zinc-700 text-gray-300 hover:bg-zinc-600 px-2 py-0.5"
                >
                    {piece.name}
                </Badge>
            ))}
            {remainingCount > 0 && (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="secondary"
                                className="text-xs bg-zinc-600 text-gray-300 hover:bg-zinc-500 px-2 py-0.5"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                {remainingCount}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                                <p className="font-medium">
                                    Additional pieces:
                                </p>
                                {pieces.slice(maxVisible).map((piece) => (
                                    <p key={piece.id} className="text-sm">
                                        {piece.name}
                                    </p>
                                ))}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
}

interface SessionsListProps {
    onOpenRecording: (session: Recording) => void;
    onEdit: (session: Recording) => void;
    onDelete: (session: Recording) => void;
}

export default function SessionsList({
    onOpenRecording,
    onEdit,
    onDelete,
}: SessionsListProps) {
    const { sessions } = useFetchSessions();

    const handleEdit = (session: Recording, e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(session);
    };

    const handleDelete = (session: Recording, e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(session);
    };

    return (
        <div className="grid gap-2">
            {sessions.map((session) => (
                <ItemCard
                    key={session.id}
                    title={session.name || "Untitled"}
                    subtitle={session.performer || "—"}
                    centerContent={
                        <div className="flex gap-6">
                            <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1.5" /> {"—"}
                            </div>
                            {/* Pieces List */}
                            <PiecesList
                                pieces={(session.session_pieces || []).map(
                                    (rp: { pieces: Piece }) => rp.pieces,
                                )}
                            />
                        </div>
                    }
                    tags={session.key ? [{ text: session.key }] : []}
                    actions={[
                        // {
                        //     icon: <Play className="h-4 w-4 ml-0.5" />,
                        //     label: "Play",
                        //     onClick: (e) => {
                        //         e.stopPropagation();
                        //         onOpenRecording(session);
                        //     },
                        //     className:
                        //         "bg-green-500 hover:bg-green-400 text-black hover:scale-105",
                        // },
                        {
                            icon: <Edit className="h-4 w-4" />,
                            label: "Edit",
                            onClick: (e) => handleEdit(session, e),
                        },
                        {
                            icon: <Trash2 className="h-4 w-4" />,
                            label: "Delete",
                            onClick: (e) => handleDelete(session, e),
                        },
                    ]}
                    onClick={() => onOpenRecording(session)}
                />
            ))}
        </div>
    );
}
