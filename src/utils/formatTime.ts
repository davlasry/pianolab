// src/utils/formatTime.ts
/**
 * Convert seconds into mm:ss (or hh:mm:ss if ≥1h).
 */
export function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const mm = mins.toString().padStart(2, "0");
    const ss = secs.toString().padStart(2, "0");

    return hrs > 0
        ? `${hrs}:${mm}:${ss}` // e.g. "1:05:09"
        : `${mm}:${ss}`; // e.g. "05:09"
}
