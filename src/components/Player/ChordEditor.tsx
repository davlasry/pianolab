import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { X, Check, Music, Clock, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useChordProgression,
    useActiveChordIndex,
    useSelectedChordIndices,
    useChordsActions,
} from "@/stores/chordsStore";
import {
    parseChord,
    getChordSuggestions,
    getProgressionSuggestions,
    type ChordInfo,
} from "@/lib/chordAnalysis";

export const ChordEditor = () => {
    const chordProgression = useChordProgression();
    const activeChordIndex = useActiveChordIndex();
    const selectedChordIndices = useSelectedChordIndices();
    const { updateChordLabel, setActiveChord } = useChordsActions();

    const [editValue, setEditValue] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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

    // Handle mounting animation
    useEffect(() => {
        if (activeChord) {
            setIsVisible(true);
            setEditValue(activeChord.label);
            setIsEditing(false);
        } else {
            setIsVisible(false);
        }
    }, [activeChord]);

    // Focus input when starting to edit
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Only show editor when exactly one chord is selected
    if (!activeChord || activeChordIndex === null || selectedChordIndices.length !== 1) {
        return null;
    }

    const handleStartEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        if (activeChordIndex !== null) {
            updateChordLabel(activeChordIndex, editValue);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (activeChord) {
            setEditValue(activeChord.label);
        }
        setIsEditing(false);
    };

    const handleClose = () => {
        setActiveChord(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            e.preventDefault();
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
        <div
            className={cn(
                "border-b border-border/40 bg-gradient-to-r from-card/30 to-card/60 backdrop-blur-sm",
                "transform overflow-hidden transition-all duration-150 ease-out",
                isVisible
                    ? "max-h-[200px] translate-y-0"
                    : "max-h-0 -translate-y-full",
            )}
            style={{
                transitionProperty: "transform, max-height",
            }}
        >
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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>

                {/* Chord Analysis & Editing */}
                <div className="space-y-3">
                    {/* Chord Info Display */}
                    {chordInfo && !isEditing && (
                        <div className="flex items-center gap-2 text-sm">
                            <Music className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                                {chordInfo.root}
                            </span>
                            <Badge
                                variant={getQualityColor(chordInfo.quality)}
                                className="text-xs"
                            >
                                {chordInfo.quality}
                            </Badge>
                            {chordInfo.extensions.map((ext, i) => (
                                <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                >
                                    {ext}
                                </Badge>
                            ))}
                            {chordInfo.bass && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <span>/</span>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {chordInfo.bass}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Editing Interface */}
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <div className="flex flex-1 items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="flex-1">
                                            <Input
                                                ref={inputRef}
                                                value={editValue}
                                                onChange={(e) =>
                                                    setEditValue(e.target.value)
                                                }
                                                onKeyDown={handleKeyDown}
                                                placeholder="Enter chord (e.g., Cmaj7, F#m, G7)"
                                                className="text-sm"
                                            />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-80 p-0"
                                        align="start"
                                    >
                                        <Command>
                                            <CommandInput placeholder="Search chords..." />
                                            <CommandList>
                                                <CommandEmpty>
                                                    No chords found.
                                                </CommandEmpty>
                                                {progressionSuggestions.length >
                                                    0 && (
                                                    <CommandGroup heading="Common Next Chords">
                                                        {progressionSuggestions.map(
                                                            (chord) => (
                                                                <CommandItem
                                                                    key={chord}
                                                                    onSelect={() =>
                                                                        handleSuggestionSelect(
                                                                            chord,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Music className="h-4 w-4" />
                                                                    <span>
                                                                        {chord}
                                                                    </span>
                                                                    {parseChord(
                                                                        chord,
                                                                    ) && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="ml-auto text-xs"
                                                                        >
                                                                            {
                                                                                parseChord(
                                                                                    chord,
                                                                                )!
                                                                                    .quality
                                                                            }
                                                                        </Badge>
                                                                    )}
                                                                </CommandItem>
                                                            ),
                                                        )}
                                                    </CommandGroup>
                                                )}
                                                <CommandGroup heading="All Chords">
                                                    {suggestions.map(
                                                        (chord) => (
                                                            <CommandItem
                                                                key={chord}
                                                                onSelect={() =>
                                                                    handleSuggestionSelect(
                                                                        chord,
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                            >
                                                                <Music className="h-4 w-4" />
                                                                <span>
                                                                    {chord}
                                                                </span>
                                                                {parseChord(
                                                                    chord,
                                                                ) && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="ml-auto text-xs"
                                                                    >
                                                                        {
                                                                            parseChord(
                                                                                chord,
                                                                            )!
                                                                                .quality
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </CommandItem>
                                                        ),
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    className="h-8 w-8 p-0"
                                    disabled={!editValue.trim()}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-1 items-center gap-2">
                                <div
                                    className={cn(
                                        "min-h-[36px] flex-1 rounded-md border bg-background/50 px-3 py-2",
                                        "cursor-pointer transition-all duration-200 hover:border-accent-foreground/20 hover:bg-accent/50",
                                        "flex items-center text-sm backdrop-blur-sm",
                                        !activeChord.label &&
                                            "text-muted-foreground italic",
                                    )}
                                    onClick={handleStartEdit}
                                >
                                    {activeChord.label || (
                                        <span className="flex items-center gap-2">
                                            <Music className="h-4 w-4" />
                                            Click to add chord name
                                        </span>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleStartEdit}
                                    className="text-xs"
                                >
                                    Edit
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
