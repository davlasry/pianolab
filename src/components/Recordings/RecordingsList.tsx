import type { Recording } from "@/types/entities.types.ts";
import { Button } from "@/components/ui/button.tsx";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
    recordings: Recording[];
    onEdit: (recording: Recording) => void;
    onDelete: (recording: Recording) => void;
}

export const RecordingsList = ({ recordings, onEdit, onDelete }: Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordings.map((recording) => (
                <div
                    key={recording.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between">
                        <h3 className="font-bold text-lg">
                            {recording.performer
                                ? `${recording.performer}'s Recording`
                                : "Recording"}
                        </h3>
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="p-1 h-8 w-8"
                                onClick={() => onEdit(recording)}
                                title="Edit recording"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => onDelete(recording)}
                                title="Delete recording"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {recording.performer && (
                        <p className="text-gray-600">
                            Performer: {recording.performer}
                        </p>
                    )}
                    {recording.key && (
                        <p className="text-gray-600">Key: {recording.key}</p>
                    )}
                    {recording.created_at && (
                        <p className="text-gray-600">
                            Date:{" "}
                            {new Date(
                                recording.created_at,
                            ).toLocaleDateString()}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};
