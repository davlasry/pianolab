interface AutoScrollIconProps {
    className?: string;
}

export function AutoScrollIcon({ className }: AutoScrollIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 8h18" />
            <path d="M17 4v4" />
            <path d="M3 16h18" />
            <path d="M17 12v4" />
        </svg>
    );
}
