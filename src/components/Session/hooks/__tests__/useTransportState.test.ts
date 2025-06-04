import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockInstance } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransportState } from "../useTransportState";
import * as Tone from "tone";

// Create a mock transport factory to ensure consistent mock between tests
const createMockTransport = () => ({
    state: "stopped",
    on: vi.fn(),
    off: vi.fn(),
});

vi.mock("tone", () => ({
    getTransport: vi.fn(),
}));

describe("useTransportState", () => {
    let mockTransport: ReturnType<typeof createMockTransport>;

    beforeEach(() => {
        mockTransport = createMockTransport();
        (Tone.getTransport as unknown as MockInstance).mockReturnValue(
            mockTransport,
        );
    });

    it("initializes with current transport state", () => {
        const { result } = renderHook(() => useTransportState());
        expect(result.current.transportState).toBe("stopped");
    });

    it("subscribes to transport events on mount", () => {
        renderHook(() => useTransportState());
        expect(mockTransport.on).toHaveBeenCalledWith(
            "start",
            expect.any(Function),
        );
        expect(mockTransport.on).toHaveBeenCalledWith(
            "stop",
            expect.any(Function),
        );
        expect(mockTransport.on).toHaveBeenCalledWith(
            "pause",
            expect.any(Function),
        );
    });

    it("updates state when transport events fire", () => {
        const { result } = renderHook(() => useTransportState());

        // Get the callback registered for 'start'
        const startCallback = mockTransport.on.mock.calls.find(
            ([event]) => event === "start",
        )?.[1];

        // Update transport state and call the callback
        Object.defineProperty(mockTransport, "state", { value: "started" });
        act(() => {
            startCallback?.();
        });
        expect(result.current.transportState).toBe("started");

        // Test pause
        Object.defineProperty(mockTransport, "state", { value: "paused" });
        const pauseCallback = mockTransport.on.mock.calls.find(
            ([event]) => event === "pause",
        )?.[1];
        act(() => {
            pauseCallback?.();
        });
        expect(result.current.transportState).toBe("paused");

        // Test stop
        Object.defineProperty(mockTransport, "state", { value: "stopped" });
        const stopCallback = mockTransport.on.mock.calls.find(
            ([event]) => event === "stop",
        )?.[1];
        act(() => {
            stopCallback?.();
        });
        expect(result.current.transportState).toBe("stopped");
    });

    it("unsubscribes from transport events on unmount", () => {
        const { unmount } = renderHook(() => useTransportState());

        // Get the callbacks that were registered
        const startCallback = mockTransport.on.mock.calls.find(
            ([event]) => event === "start",
        )?.[1];
        const stopCallback = mockTransport.on.mock.calls.find(
            ([event]) => event === "stop",
        )?.[1];
        const pauseCallback = mockTransport.on.mock.calls.find(
            ([event]) => event === "pause",
        )?.[1];

        unmount();

        // Verify each event handler is unsubscribed with the same callback
        expect(mockTransport.off).toHaveBeenCalledWith("start", startCallback);
        expect(mockTransport.off).toHaveBeenCalledWith("stop", stopCallback);
        expect(mockTransport.off).toHaveBeenCalledWith("pause", pauseCallback);
    });
});
