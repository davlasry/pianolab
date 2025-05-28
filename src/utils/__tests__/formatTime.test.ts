import { describe, it, expect } from "vitest";
import { formatTime } from "../formatTime";

describe("formatTime", () => {
    it.each([
        [0, "00:00"],
        [5, "00:05"],
        [75, "01:15"],
        [3600, "1:00:00"],
        [3909, "1:05:09"],
        [-10, "00:00"],
        [Number.NaN, "00:00"],
    ])("converts %p → %p", (secs, expected) => {
        expect(formatTime(secs)).toBe(expected);
    });
}); 