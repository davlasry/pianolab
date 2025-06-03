import { useState } from "react";
import { useDeleteSession } from "@/hooks/queries/useDeleteSession.ts";
import { RecordingFormModal } from "@/components/Recordings/SessionFormModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { Session } from "@/types/entities.types.ts";
import { Plus, Music } from "lucide-react";
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
import { useFetchSessions } from "@/hooks/queries/useFetchSessions.ts";
import { SessionsTable } from "@/components/Recordings/SessionsTable.tsx";

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
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Music className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
                </div>
                <Button
                    onClick={openCreateModal}
                    variant="default"
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    New Session
                </Button>
            </div>

            <div className="rounded-lg border bg-card p-0 shadow-sm">
                {loading ? (
                    <div className="flex h-[300px] items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground">Loading sessions...</p>
                        </div>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Music className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">No sessions yet</h3>
                            <p className="text-muted-foreground">
                                Create your first session to get started
                            </p>
                        </div>
                        <Button onClick={openCreateModal} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Session
                        </Button>
                    </div>
                ) : (
                    <SessionsTable
                        sessions={sessions}
                        onOpenSession={handleRecordingClick}
                        onEdit={openEditModal}
                        onDelete={handleDeleteRecording}
                    />
                )}
            </div>

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
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
