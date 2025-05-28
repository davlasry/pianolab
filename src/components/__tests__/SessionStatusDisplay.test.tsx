import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionStatusDisplay } from "../SessionStatusDisplay";
import type { Session } from "@/types/entities.types";
import "@testing-library/jest-dom";

// Helper to create a minimal session object for tests
const makeSession = (overrides: Partial<Session> = {}): Session =>
    ({
        // minimum subset of the supabase row
        id: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        performer: "Test Performer",
        key: "C Major",
        ...overrides,
    }) as unknown as Session;

describe("SessionStatusDisplay", () => {
    it("shows loading indicator when isLoading is true", () => {
        render(
            <SessionStatusDisplay
                isLoading
                error={null}
                session={null}
                isReady={false}
            />,
        );
        expect(
            screen.getByText(/Loading session details/i),
        ).toBeInTheDocument();
    });

    it("renders error message when error prop provided", () => {
        render(
            <SessionStatusDisplay
                isLoading={false}
                error="Something blew up"
                session={null}
                isReady={false}
            />,
        );
        expect(
            screen.getByText(/Error: Something blew up/i),
        ).toBeInTheDocument();
    });

    it("shows not found when session is null and no error", () => {
        render(
            <SessionStatusDisplay
                isLoading={false}
                error={null}
                session={null}
                isReady={false}
            />,
        );
        expect(screen.getByText(/Recording not found/i)).toBeInTheDocument();
    });

    it("shows loading audio when session exists but not ready", () => {
        const session = makeSession({ performer: "Alice", key: "G Minor" });
        render(
            <SessionStatusDisplay
                isLoading={false}
                error={null}
                session={session}
                isReady={false}
            />,
        );
        expect(
            screen.getByText(/Loading audio and MIDI files/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/"Alice's Recording"/i)).toBeInTheDocument();
        expect(screen.getByText(/G Minor/i)).toBeInTheDocument();
    });

    it("renders nothing when ready and no issues", () => {
        const session = makeSession();
        const { container } = render(
            <SessionStatusDisplay
                isLoading={false}
                error={null}
                session={session}
                isReady
            />,
        );
        expect(container.firstChild).toBeNull();
    });
});
