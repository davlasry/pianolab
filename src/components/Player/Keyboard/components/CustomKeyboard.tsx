import type {
    CustomKeyComponent,
    Note,
} from "@/components/Player/Keyboard/types.ts";

// Shared props for both key components
export type CustomKeyProps = {
    active: boolean;
    note: Note; // kept for future use if needed
    isChordNote?: boolean;
    className?: string;
};

const ACTIVE_CLASSES = "bg-primary";
const INACTIVE_WHITE_CLASSES =
    "bg-gradient-to-b from-neutral-600 to-neutral-800";
// const INACTIVE_BLACK_CLASSES =
//     "bg-gradient-to-b from-neutral-700 to-neutral-900";
const INACTIVE_BLACK_CLASSES = "bg-neutral-800";

export const CustomWhiteKey: CustomKeyComponent = ({
    active,
    isChordNote,
    className = "",
}: CustomKeyProps) => (
    <div
        className={`relative mx-0.5 h-full flex-1 cursor-pointer rounded-md shadow-lg transition-all duration-75 ${active || isChordNote ? ACTIVE_CLASSES : INACTIVE_WHITE_CLASSES} ${className} `}
    >
        {/* Subtle inner shadow to give keys depth */}
        {/*<div*/}
        {/*    className="pointer-events-none absolute inset-0"*/}
        {/*    style={{ boxShadow: "inset 0 -3px 2px rgba(0,0,0,0.3)" }}*/}
        {/*/>*/}

        {/* Top shine effect */}
        {/*<div*/}
        {/*    className="pointer-events-none absolute top-0 right-0 left-0 h-[5%] opacity-10"*/}
        {/*    style={{*/}
        {/*        background:*/}
        {/*            "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",*/}
        {/*    }}*/}
        {/*/>*/}
    </div>
);

export const CustomBlackKey: CustomKeyComponent = ({
    active,
    isChordNote,
    className = "",
}: CustomKeyProps) => (
    <div
        className={`absolute z-10 h-full w-full cursor-pointer rounded-md shadow-lg transition-all duration-75 ${active || isChordNote ? ACTIVE_CLASSES : INACTIVE_BLACK_CLASSES} ${className} `}
    >
        {/* Subtle inner shadow to give keys depth */}
        {/*<div*/}
        {/*    className="pointer-events-none absolute inset-0"*/}
        {/*    style={{ boxShadow: "inset 0 -3px 2px rgba(0,0,0,0.5)" }}*/}
        {/*/>*/}

        {/* Top shine effect */}
        {/*<div*/}
        {/*    className="pointer-events-none absolute top-0 right-0 left-0 h-[5%] opacity-5"*/}
        {/*    style={{*/}
        {/*        background:*/}
        {/*            "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)",*/}
        {/*    }}*/}
        {/*/>*/}
    </div>
);

export const CustomLabel = () => null;

export const customKeyboard = {
    whiteKey: CustomWhiteKey,
    blackKey: CustomBlackKey,
    label: CustomLabel,
};
