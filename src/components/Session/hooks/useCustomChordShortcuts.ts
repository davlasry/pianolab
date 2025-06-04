import { useShortcut } from "@/shortcuts/KeyboardShortcuts";
import { useChordsActions } from "@/stores/chordsStore";
import { useCustomPlayerContext } from "@/components/Session/context/CustomPlayerContext";

export const useCustomChordShortcuts = () => {
    const { addChordAtTime } = useChordsActions();
    const { isPlayerReady, currentTime } = useCustomPlayerContext();

    // 'n' key - Add a new chord at the current time
    useShortcut({
        key: "n",
        description: "Add a new chord at current time",
        when: () => isPlayerReady,
        handler: (e) => {
            e.preventDefault();
            addChordAtTime(currentTime);
        },
        stopPropagation: true,
    });
};
