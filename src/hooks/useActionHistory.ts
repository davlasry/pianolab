import { useState, useCallback } from "react";

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

export const useActionHistory = <T>(initialState: T, maxHistorySize = 20) => {
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: [],
    });

    const executeAction = useCallback(
        (newState: T) => {
            setHistory((current) => ({
                past: [...current.past, current.present].slice(-maxHistorySize),
                present: newState,
                future: [], // Clear future when new action is performed
            }));
        },
        [maxHistorySize],
    );

    const updatePresent = useCallback((newState: T) => {
        setHistory((current) => ({
            ...current,
            present: newState,
            // Don't modify past or future - this is just a live update
        }));
    }, []);

    const undo = useCallback(() => {
        setHistory((current) => {
            if (current.past.length === 0) return current;

            const previous = current.past[current.past.length - 1];
            const newPast = current.past.slice(0, -1);

            return {
                past: newPast,
                present: previous,
                future: [current.present, ...current.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((current) => {
            if (current.future.length === 0) return current;

            const next = current.future[0];
            const newFuture = current.future.slice(1);

            return {
                past: [...current.past, current.present],
                present: next,
                future: newFuture,
            };
        });
    }, []);

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    return {
        state: history.present,
        executeAction,
        updatePresent,
        undo,
        redo,
        canUndo,
        canRedo,
    };
};
