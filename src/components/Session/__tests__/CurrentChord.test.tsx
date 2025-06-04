import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentChord } from "../CurrentChord";
import "@testing-library/jest-dom";

describe("CurrentChord", () => {
    it("displays the provided chord", () => {
        render(<CurrentChord chord="Cmaj7" />);
        expect(screen.getByText("Cmaj7")).toBeInTheDocument();
        expect(screen.getByText("Chord")).toBeInTheDocument();
    });

    it("shows dash when no chord provided", () => {
        render(<CurrentChord chord="" />);
        expect(screen.getByText("-")).toBeInTheDocument();
    });
});
