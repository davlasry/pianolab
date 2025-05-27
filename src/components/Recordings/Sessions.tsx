import { useState } from "react";
import { useDeleteSession } from "@/hooks/queries/useDeleteSession.ts";
import { RecordingFormModal } from "@/components/Recordings/SessionFormModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { Session } from "@/types/entities.types.ts";
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
import { useNavigate } from "react-router-dom";
import SessionsList from "@/components/Recordings/SessionsList.tsx";
import { useFetchSessions } from "@/hooks/queries/useFetchSessions.ts";

export const Sessions = () => {
    const navigate = useNavigate();
    const { sessions, loading, refresh } = useFetchSessions();
    const { deleteRecording, isLoading: isDeleting } = useDeleteSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedRecording, setSelectedRecording] = useState<
        Session | undefined
    >(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sessionToDelete, setRecordingToDelete] = useState<Session | null>(
        null,
    );

    const openCreateModal = () => {
        setModalMode("create");
        setSelectedRecording(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (session: Session) => {
        setModalMode("edit");
        setSelectedRecording(session);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleDeleteRecording = (session: Session) => {
        setRecordingToDelete(session);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (sessionToDelete) {
            const success = await deleteRecording(sessionToDelete.id);
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

    const handleRecordingClick = (session: Session) => {
        navigate(`/session/${session.id}`);
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Sessions</h2>
                <Button
                    onClick={openCreateModal}
                    size="icon"
                    variant="secondary"
                >
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">Add Recording</span>
                </Button>
            </div>
            {loading ? (
                <p>Loading sessions...</p>
            ) : sessions.length === 0 ? (
                <p className="text-gray-500">
                    No sessions found. Create your first session!
                </p>
            ) : (
                <SessionsList
                    onOpenRecording={handleRecordingClick}
                    onEdit={openEditModal}
                    onDelete={handleDeleteRecording}
                />
            )}

            <RecordingFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={refresh}
                session={selectedRecording}
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
                            This will permanently delete this session
                            {sessionToDelete?.performer &&
                                ` by ${sessionToDelete.performer}`}
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
        </div>
    );
};
