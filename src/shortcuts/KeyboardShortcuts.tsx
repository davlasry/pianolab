import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    type PropsWithChildren,
} from "react";

// A single keyboard shortcut definition
export interface Shortcut {
    /**
     * The value of `event.key` to match, e.g. "ArrowRight", " ", "a".
     * If you need more advanced matching (modifiers, etc.) we can extend this
     * later – keep it simple for now.
     */
    key: string;
    /**
     * Function executed when the key is pressed and the optional guard passes.
     */
    handler: (e: KeyboardEvent) => void;
    /**
     * Optional human-readable description so we can build a cheatsheet later.
     */
    description?: string;
    /**
     * Optional predicate that must evaluate to true for the handler to fire.
     * Useful for things like "player must be ready".
     */
    when?: () => boolean;
    /**
     * Whether to call event.preventDefault(). Defaults to true because most
     * shortcuts should override the browser's default action.
     */
    preventDefault?: boolean;
    /**
     * Whether to call event.stopPropagation(). Defaults to false.
     */
    stopPropagation?: boolean;
}

interface RegistryEntry extends Shortcut {
    id: symbol;
}

interface KeyboardShortcutContextType {
    register: (shortcut: Shortcut) => symbol;
    unregister: (id: symbol) => void;
}

const KeyboardShortcutContext =
    createContext<KeyboardShortcutContextType | null>(null);

export const KeyboardShortcutProvider = ({ children }: PropsWithChildren) => {
    // Using a ref so we don't re-create the Map on every render
    const registryRef = useRef<Map<symbol, RegistryEntry>>(new Map());

    // Keep an insertion order list so that last registered overrides earlier
    // ones for the same key (useful for dialogs/modals).
    const orderRef = useRef<symbol[]>([]);

    const register = useCallback((shortcut: Shortcut) => {
        const id = Symbol(shortcut.key);
        const entry: RegistryEntry = { ...shortcut, id };
        registryRef.current.set(id, entry);
        orderRef.current.push(id);
        return id;
    }, []);

    const unregister = useCallback((id: symbol) => {
        registryRef.current.delete(id);
        orderRef.current = orderRef.current.filter((x) => x !== id);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore events when focus is inside an editable field
            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement ||
                    target.isContentEditable)
            ) {
                return;
            }

            // Iterate in reverse registration order so that newest wins
            for (let i = orderRef.current.length - 1; i >= 0; i -= 1) {
                const id = orderRef.current[i];
                const entry = registryRef.current.get(id);
                if (!entry) continue; // removed in the meantime

                if (entry.key !== e.key) continue;

                if (entry.when && !entry.when()) continue;

                // Guard passed – execute
                if (entry.preventDefault !== false) e.preventDefault();
                if (entry.stopPropagation) e.stopPropagation();

                entry.handler(e);
                break; // stop after first match (highest priority)
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const value = useMemo(
        () => ({ register, unregister }),
        [register, unregister],
    );

    return (
        <KeyboardShortcutContext.Provider value={value}>
            {children}
        </KeyboardShortcutContext.Provider>
    );
};

export const useShortcut = (shortcut: Shortcut) => {
    const ctx = useContext(KeyboardShortcutContext);
    useEffect(() => {
        if (!ctx) return;
        const id = ctx.register(shortcut);
        return () => ctx.unregister(id);
        // We intentionally omit ctx.register/unregister from deps – they are
        // stable due to useCallback. Re-register only when the shortcut object
        // itself changes.
    }, [ctx, shortcut]);
};
