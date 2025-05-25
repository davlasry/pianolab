import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Session } from "@/types/entities.types";

interface SessionHeaderProps {
    session: Session | null;
    onOpenEditModal: () => void;
}

export const SessionHeader = ({
    session,
    onOpenEditModal,
}: SessionHeaderProps) => {
    if (!session) return null;

    return (
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
                {session.name ||
                    (session.performer
                        ? `${session.performer}'s Recording`
                        : "Recording")}
            </h1>
            <Button
                onClick={onOpenEditModal}
                size="sm"
                className="flex items-center gap-1"
            >
                <Pencil className="h-4 w-4" />
                Edit
            </Button>
        </div>
    );
};
