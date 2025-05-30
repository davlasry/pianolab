import type {
    CustomKeyComponent,
    Note,
} from "@/components/Player/Keyboard/types.ts";

interface CustomKeyProps {
    active: boolean;
    note: Note;
    isChordNote?: boolean;
    className?: string;
}

const baseClasses = "w-full h-full transition-colors duration-100";

export const defaultKeyComponents = {
    whiteKey: ({ active, isChordNote }: CustomKeyProps) => (
        <div
            className={` ${baseClasses} ${
                active ? "bg-red-500" : isChordNote ? "bg-primary" : "bg-white"
            } border border-gray-300`}
        />
    ),
    blackKey: ({ active, isChordNote }: CustomKeyProps) => (
        <div
            className={` ${baseClasses} ${
                active
                    ? "bg-red-700"
                    : isChordNote
                      ? "bg-primary"
                      : "bg-gray-900"
            } border-r border-l border-gray-800`}
        />
    ),
} satisfies Record<string, CustomKeyComponent>;
