import { create } from "zustand";

interface SessionState {
    sessionId: string | null;
    setSessionId: (id: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    sessionId: null,
    setSessionId: (id) => set({ sessionId: id }),
}));

// Selector hooks
export const useSessionId = () => useSessionStore((state) => state.sessionId);
export const useSetSessionId = () =>
    useSessionStore((state) => state.setSessionId);
