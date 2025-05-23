import { Clock, Edit, Trash2, Play } from "lucide-react";
import { useFetchRecordings } from "@/hooks/queries/useFetchRecordings.ts";
import type { Recording } from "@/types/entities.types.ts";
import { ItemCard } from "@/components/shared/ItemCard.tsx";

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
                        centerContent={
                            <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1.5" />
                                {"—"}
                            </div>
                        }
                        tags={recording.key ? [{ text: recording.key }] : []}
                        actions={[
                            {
                                icon: <Play className="h-4 w-4 ml-0.5" />,
                                label: "Play",
                                onClick: (e) => {
                                    e.stopPropagation();
                                    onOpenRecording(recording);
                                },
                                className:
                                    "bg-green-500 hover:bg-green-400 text-black hover:scale-105",
                            },
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
