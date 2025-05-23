import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Clock, Edit, Trash2, Play, Music } from "lucide-react";
import { useFetchRecordings } from "@/hooks/useFetchRecordings.ts";
import type { Recording } from "@/types/entities.types.ts";

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
        <div className="container mx-auto  max-w-5xl">
            <div className="grid gap-2">
                {recordings.map((recording) => (
                    <Card
                        key={recording.id}
                        className="overflow-hidden border-0 bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 cursor-pointer py-4 px-0"
                        onClick={() => onOpenRecording(recording)}
                    >
                        <div className="flex items-center px-4">
                            <div className="h-12 w-12 rounded-md bg-zinc-800 flex items-center justify-center mr-4">
                                <Music className="h-6 w-6 text-zinc-400" />
                            </div>

                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-4">
                                <div className="col-span-2 md:col-span-1">
                                    <h3 className="font-medium text-base text-white line-clamp-1">
                                        {recording.name}
                                    </h3>
                                    {/*<p className="text-sm text-zinc-400">*/}
                                    {/*    {recording.author || "No author"}*/}
                                    {/*</p>*/}
                                </div>

                                <div className="flex items-center text-sm text-zinc-400">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                                    {/*{recording.length || "—"}*/}
                                    {"—"}
                                </div>

                                <div className="text-sm">
                                    {/*<span className="inline-block px-2 py-0.5 bg-zinc-800 rounded-sm text-zinc-400 text-xs">*/}
                                    {/*    {recording.style || "—"}*/}
                                    {/*</span>*/}
                                    {recording.key && (
                                        <span className="inline-block px-2 py-0.5 bg-zinc-800 rounded-sm text-zinc-400 text-xs ml-2">
                                            {recording.key}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenRecording(recording);
                                    }}
                                    className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-400 text-black hover:scale-105 transition-all"
                                >
                                    <Play className="h-4 w-4 ml-0.5" />
                                    <span className="sr-only">Play</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleEdit(recording, e)}
                                    className="h-8 w-8 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-all"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleDelete(recording, e)}
                                    className="h-8 w-8 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-all"
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
}
