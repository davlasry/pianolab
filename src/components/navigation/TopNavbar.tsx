import { ChevronLeft, Undo, Redo, Pencil, Music, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, Link } from "react-router-dom";
import { TimelineAuxControls } from "@/components/Player/Timeline/TimelineAuxControls";
import LoopControls from "@/components/Player/Controls/components/LoopControls";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { LinkedPiecesDisplay } from "@/components/LinkedPiecesDisplay";
import type { Piece } from "@/types/entities.types";

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
    linkedPieces?: Piece[];
    piecesLoading?: boolean;
}

export const TopNavbar = ({
    sessionTitle,
    onEdit,
    onSetStartAtPlayhead,
    onSubmitSelection,
    onResetSelection,
    selectionStart,
    isSelectionComplete,
    isCreatingLoop,
    activeLoop,
    isLoopActive,
    onToggleLoop,
    linkedPieces = [],
    piecesLoading = false,
}: TopNavbarProps) => {
    const navigate = useNavigate();
    const { sessionId } = useParams();

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
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <h1
                                className="max-w-[250px] truncate text-sm font-medium"
                                title={sessionTitle}
                            >
                                {sessionTitle}
                            </h1>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start">
                            <p>{sessionTitle}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="flex items-center gap-4">
                <TimelineAuxControls />

                <LoopControls
                    onSetStartAtPlayhead={onSetStartAtPlayhead}
                    onSubmitSelection={onSubmitSelection}
                    onResetSelection={onResetSelection}
                    selectionStart={selectionStart}
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

                    <Popover>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Linked pieces"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Linked pieces</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <PopoverContent align="end" className="w-80 p-3">
                            <LinkedPiecesDisplay
                                pieces={linkedPieces}
                                isLoading={piecesLoading}
                                compact
                            />
                        </PopoverContent>
                    </Popover>

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
                    {sessionId && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        aria-label="Open in custom player"
                                    >
                                        <Link
                                            to={`/custom-player/${sessionId}`}
                                        >
                                            <Music className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>
                                        Try our new custom player with
                                        variable-speed playback
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
