import { useShortcut } from "@/shortcuts/KeyboardShortcuts.tsx";
import { useChordsActions } from "@/stores/chordsStore";
import { usePlayerContext } from "../context/PlayerContext";

export const useChordShortcuts = () => {
    const { addChordAtTime } = useChordsActions();
    const { getTransport, isReady } = usePlayerContext();

    useShortcut({
        key: "n",
        description: "Add a new chord at current time",
        when: () => isReady,
        handler: (e) => {
            e.preventDefault();
            const currentTime = getTransport().seconds;
            addChordAtTime(currentTime);
        },
        stopPropagation: true,
    });
};
