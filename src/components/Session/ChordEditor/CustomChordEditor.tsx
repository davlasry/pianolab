import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command.tsx";
import { X, Check, Music, Clock, Hash } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
    useChordProgression,
    useActiveChordIndex,
    useSelectedChordIndices,
    useChordsActions,
    useEditModeTriggered,
} from "@/stores/chordsStore.ts";
import {
    parseChord,
    getChordSuggestions,
    getProgressionSuggestions,
    type ChordInfo,
} from "@/lib/chordAnalysis.ts";
import { useCustomPlayerContext } from "src/components/Session/context/CustomPlayerContext.tsx";

export const CustomChordEditor = () => {
    // Include the custom player context but we don't need to extract anything from it
    useCustomPlayerContext();

    const chordProgression = useChordProgression();
    const activeChordIndex = useActiveChordIndex();
    const selectedChordIndices = useSelectedChordIndices();
    const editModeTriggered = useEditModeTriggered();
    const { updateChordLabel } = useChordsActions();

    const [editValue, setEditValue] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastSeenEditTrigger = useRef(0);

    const activeChord =
        activeChordIndex !== null ? chordProgression[activeChordIndex] : null;
    const chordInfo: ChordInfo | null = activeChord?.label
        ? parseChord(activeChord.label)
        : null;

    // Get chord suggestions based on current input
    const suggestions = getChordSuggestions(editValue);
    const progressionSuggestions =
        activeChord && activeChordIndex !== null
            ? getProgressionSuggestions(
                  activeChord.label,
                  chordProgression
                      .slice(0, activeChordIndex)
                      .map((c) => c.label),
              )
            : [];

    // Update edit value when active chord changes
    useEffect(() => {
        if (activeChord) {
            setEditValue(activeChord.label);
        } else {
            setIsEditing(false);
        }
    }, [activeChord, activeChordIndex]);

    // Focus input when starting to edit OR when active chord changes
    useEffect(() => {
        if (isEditing && inputRef.current) {
            // Small delay to ensure the input is rendered and visible
            const timer = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isEditing, activeChord]);

    // Listen for external edit mode triggers (like Enter key)
    useEffect(() => {
        // Only enter edit mode if editModeTriggered has actually incremented
        // and this specific trigger hasn't been processed yet.
        if (
            editModeTriggered > lastSeenEditTrigger.current &&
            activeChord &&
            !isEditing
        ) {
            setIsEditing(true);
            lastSeenEditTrigger.current = editModeTriggered; // Mark this trigger as processed
        }
    }, [editModeTriggered, activeChord, isEditing]);

    // Only show editor when exactly one chord is selected
    if (
        !activeChord ||
        activeChordIndex === null ||
        selectedChordIndices.length !== 1
    ) {
        return null;
    }

    const handleStartEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        if (activeChordIndex !== null) {
            updateChordLabel(activeChordIndex, editValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (activeChord) {
            setEditValue(activeChord.label);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            handleSave();
        } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            handleCancel();
        }
    };

    const handleSuggestionSelect = (suggestion: string) => {
        setEditValue(suggestion);
        if (activeChordIndex !== null) {
            updateChordLabel(activeChordIndex, suggestion);
            setIsEditing(false);
        }
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case "major":
                return "default";
            case "minor":
                return "secondary";
            case "diminished":
                return "destructive";
            case "augmented":
                return "outline";
            case "suspended":
                return "info";
            default:
                return "default";
        }
    };

    return (
        <div className="border-b border-border/40 bg-gradient-to-r from-card/30 to-card/60 backdrop-blur-sm">
            <div className="px-4 py-3">
                {/* Header with chord position info */}
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                Chord {activeChordIndex + 1}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{activeChord.startTime.toFixed(1)}s</span>
                            <span>•</span>
                            <span>{activeChord.duration.toFixed(1)}s</span>
                        </div>
                    </div>
                </div>

                {/* Chord Analysis & Editing */}
                <div className="space-y-3">
                    {/* Chord Info Display */}
                    {chordInfo && !isEditing && (
                        <div className="flex items-center gap-4">
                            <div className="flex w-48 flex-col gap-1">
                                <div
                                    className="flex items-center gap-2 text-xl font-bold"
                                    onClick={handleStartEdit}
                                >
                                    <Music className="h-4 w-4 text-primary" />
                                    <span>{activeChord.label}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {chordInfo.root && (
                                        <Badge
                                            className="px-1.5 py-0"
                                            variant="outline"
                                        >
                                            Root: {chordInfo.root}
                                        </Badge>
                                    )}
                                    {chordInfo.quality && (
                                        <Badge
                                            className="px-1.5 py-0"
                                            variant={getQualityColor(
                                                chordInfo.quality,
                                            )}
                                        >
                                            {chordInfo.quality}
                                        </Badge>
                                    )}
                                    {chordInfo.extensions && (
                                        <Badge
                                            className="px-1.5 py-0"
                                            variant="secondary"
                                        >
                                            {chordInfo.extensions}
                                        </Badge>
                                    )}
                                    {chordInfo.bass && (
                                        <Badge
                                            className="px-1.5 py-0"
                                            variant="destructive"
                                        >
                                            /{chordInfo.bass}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-1 items-center justify-end">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleStartEdit}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Chord Edit Form */}
                    {isEditing && (
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    placeholder="e.g. Cmaj7, Dm7, G7b9..."
                                    value={editValue}
                                    onChange={(e) =>
                                        setEditValue(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    ref={inputRef}
                                    className="pr-24 text-base"
                                />

                                <div className="absolute top-1/2 right-2 flex -translate-y-1/2 gap-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 rounded-sm px-2"
                                            >
                                                Suggest
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="end"
                                            className="p-0"
                                        >
                                            <Command>
                                                <CommandInput placeholder="Search chord..." />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        No matching chords
                                                    </CommandEmpty>
                                                    {progressionSuggestions.length >
                                                        0 && (
                                                        <CommandGroup heading="Common Progressions">
                                                            {progressionSuggestions.map(
                                                                (
                                                                    suggestion,
                                                                    index,
                                                                ) => (
                                                                    <CommandItem
                                                                        key={`prog-${index}`}
                                                                        onSelect={() =>
                                                                            handleSuggestionSelect(
                                                                                suggestion,
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            suggestion
                                                                        }
                                                                    </CommandItem>
                                                                ),
                                                            )}
                                                        </CommandGroup>
                                                    )}
                                                    <CommandGroup heading="Suggestions">
                                                        {suggestions.map(
                                                            (
                                                                suggestion,
                                                                index,
                                                            ) => (
                                                                <CommandItem
                                                                    key={`sugg-${index}`}
                                                                    onSelect={() =>
                                                                        handleSuggestionSelect(
                                                                            suggestion,
                                                                        )
                                                                    }
                                                                >
                                                                    {suggestion}
                                                                </CommandItem>
                                                            ),
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    size="icon"
                                    onClick={handleSave}
                                    className={cn(
                                        "h-9 w-9 rounded-full",
                                        editValue === activeChord.label &&
                                            "text-muted-foreground",
                                    )}
                                    disabled={editValue === activeChord.label}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="h-9 w-9 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
