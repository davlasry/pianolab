import { ChevronLeft, Undo, Redo, Menu, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TimelineAuxControls } from "@/components/Player/Timeline/TimelineAuxControls";
import LoopControls from "@/components/Player/Controls/components/LoopControls";

interface TopNavbarProps {
    sessionTitle: string;
    onEdit?: () => void;
    onSetStartAtPlayhead: () => void;
    onSubmitSelection: () => void;
    onResetSelection: () => void;
    selectionStart: number | null;
    isSelectionComplete: boolean;
    isCreatingLoop: boolean;
    activeLoop: { start: number; end: number } | null;
    isLoopActive: boolean;
    onToggleLoop: () => void;
}

export const TopNavbar = ({
    sessionTitle,
    onEdit,
    onSetStartAtPlayhead,
    onSubmitSelection,
    onResetSelection,
    isSelectionComplete,
    isCreatingLoop,
    activeLoop,
    isLoopActive,
    onToggleLoop,
}: TopNavbarProps) => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-sm font-medium">{sessionTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
                <TimelineAuxControls />

                <LoopControls
                    onSetStartAtPlayhead={onSetStartAtPlayhead}
                    onSubmitSelection={onSubmitSelection}
                    onResetSelection={onResetSelection}
                    isSelectionComplete={isSelectionComplete}
                    isCreatingLoop={isCreatingLoop}
                    activeLoop={activeLoop}
                    isLoopActive={isLoopActive}
                    onToggleLoop={onToggleLoop}
                />

                <div className="flex items-center gap-2 border-l border-border pl-4">
                    <Button variant="ghost" size="icon" aria-label="Undo">
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Redo">
                        <Redo className="h-4 w-4" />
                    </Button>
                    {onEdit && (
                        <Button
                            onClick={onEdit}
                            variant="ghost"
                            size="icon"
                            aria-label="Edit session"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" aria-label="Menu">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
