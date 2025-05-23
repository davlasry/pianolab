import { useState } from "react";
import { useFetchRecordings } from "@/hooks/useFetchRecordings.ts";
import { useDeleteRecording } from "@/hooks/useDeleteRecording.ts";
import { RecordingFormModal } from "@/components/Recordings/RecordingFormModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { Recording } from "@/types/entities.types.ts";
import { Plus } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import RecordingsList from "@/components/Recordings/RecordingsList.tsx";
import { useNavigate } from "react-router-dom";

export const Recordings = () => {
    const navigate = useNavigate();
    const { recordings, loading, refresh } = useFetchRecordings();
    const { deleteRecording, isLoading: isDeleting } = useDeleteRecording();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedRecording, setSelectedRecording] = useState<
        Recording | undefined
    >(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recordingToDelete, setRecordingToDelete] =
        useState<Recording | null>(null);

    const openCreateModal = () => {
        setModalMode("create");
        setSelectedRecording(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (recording: Recording) => {
        setModalMode("edit");
        setSelectedRecording(recording);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleDeleteRecording = (recording: Recording) => {
        setRecordingToDelete(recording);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (recordingToDelete) {
            const success = await deleteRecording(recordingToDelete.id);
            if (success) {
                refresh();
            }
        }
        setDeleteDialogOpen(false);
        setRecordingToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setRecordingToDelete(null);
    };

    const handleRecordingClick = (recording: Recording) => {
        navigate(`/recording/${recording.id}`);
    };

    return (
        <Accordion type="single" collapsible defaultValue="recordings">
            <AccordionItem value="recordings">
                <div className="flex justify-between items-center">
                    <AccordionTrigger>
                        <h2 className="text-2xl font-bold">Recordings</h2>
                    </AccordionTrigger>
                    <Button
                        onClick={openCreateModal}
                        className="mr-4"
                        size="icon"
                        variant="secondary"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="sr-only">Add Recording</span>
                    </Button>
                </div>
                <AccordionContent>
                    {loading ? (
                        <p>Loading recordings...</p>
                    ) : recordings.length === 0 ? (
                        <p className="text-gray-500">
                            No recordings found. Create your first recording!
                        </p>
                    ) : (
                        <RecordingsList
                            onOpenRecording={handleRecordingClick}
                            onEdit={openEditModal}
                            onDelete={handleDeleteRecording}
                        />
                    )}
                </AccordionContent>
            </AccordionItem>

            <RecordingFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={refresh}
                recording={selectedRecording}
                mode={modalMode}
            />

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this recording
                            {recordingToDelete?.performer &&
                                ` by ${recordingToDelete.performer}`}
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={cancelDelete}
                            disabled={isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Accordion>
    );
};
