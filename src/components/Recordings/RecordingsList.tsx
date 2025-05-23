import { Clock, Edit, Trash2, Plus } from "lucide-react";
import { useFetchRecordings } from "@/hooks/queries/useFetchRecordings.ts";
import type { Recording, Piece } from "@/types/entities.types.ts";
import { ItemCard } from "@/components/shared/ItemCard.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip.tsx";

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

interface RecordingsListProps {
    onOpenRecording: (recording: Recording) => void;
    onEdit: (recording: Recording) => void;
    onDelete: (recording: Recording) => void;
}

export default function RecordingsList({
    onOpenRecording,
    onEdit,
    onDelete,
}: RecordingsListProps) {
    const { recordings } = useFetchRecordings();

    const handleEdit = (recording: Recording, e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(recording);
    };

    const handleDelete = (recording: Recording, e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(recording);
    };

    return (
        <div className="container mx-auto max-w-5xl">
            <div className="grid gap-2">
                {recordings.map((recording) => (
                    <ItemCard
                        key={recording.id}
                        title={recording.name || "Untitled"}
                        subtitle={recording.performer || "—"}
                        centerContent={
                            <div className="flex gap-6">
                                <div className="flex items-center">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" />{" "}
                                    {"—"}
                                </div>
                                {/* Pieces List */}
                                <PiecesList
                                    pieces={(
                                        recording.recording_pieces || []
                                    ).map((rp: { pieces: Piece }) => rp.pieces)}
                                />
                            </div>
                        }
                        tags={recording.key ? [{ text: recording.key }] : []}
                        actions={[
                            // {
                            //     icon: <Play className="h-4 w-4 ml-0.5" />,
                            //     label: "Play",
                            //     onClick: (e) => {
                            //         e.stopPropagation();
                            //         onOpenRecording(recording);
                            //     },
                            //     className:
                            //         "bg-green-500 hover:bg-green-400 text-black hover:scale-105",
                            // },
                            {
                                icon: <Edit className="h-4 w-4" />,
                                label: "Edit",
                                onClick: (e) => handleEdit(recording, e),
                            },
                            {
                                icon: <Trash2 className="h-4 w-4" />,
                                label: "Delete",
                                onClick: (e) => handleDelete(recording, e),
                            },
                        ]}
                        onClick={() => onOpenRecording(recording)}
                    />
                ))}
            </div>
        </div>
    );
}
