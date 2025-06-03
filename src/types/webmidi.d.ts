declare namespace WebMidi {
    interface MIDIOptions {
        sysex?: boolean;
        software?: boolean;
    }

    interface MIDIAccess extends EventTarget {
        inputs: MIDIInputMap;
        outputs: MIDIOutputMap;
        onstatechange:
            | ((this: MIDIAccess, ev: MIDIConnectionEvent) => any)
            | null;
        sysexEnabled: boolean;
    }

    interface MIDIConnectionEvent extends Event {
        port: MIDIPort;
    }

    interface MIDIMessageEvent extends Event {
        data: Uint8Array;
    }

    interface MIDIPort extends EventTarget {
        id: string;
        manufacturer?: string;
        name?: string;
        type: "input" | "output";
        version?: string;
        state: "connected" | "disconnected" | "open" | "closed" | "pending";
        connection: "open" | "closed" | "pending";
        onstatechange:
            | ((this: MIDIPort, ev: MIDIConnectionEvent) => any)
            | null;
        open(): Promise<MIDIPort>;
        close(): Promise<MIDIPort>;
    }

    interface MIDIInput extends MIDIPort {
        type: "input";
        onmidimessage: ((this: MIDIInput, ev: MIDIMessageEvent) => any) | null;
    }

    interface MIDIOutput extends MIDIPort {
        type: "output";
        send(data: number[] | Uint8Array, timestamp?: number): void;
        clear(): void;
    }

    interface MIDIInputMap extends Map<string, MIDIInput> {}
    interface MIDIOutputMap extends Map<string, MIDIOutput> {}
}

interface Navigator {
    requestMIDIAccess(
        options?: WebMidi.MIDIOptions,
    ): Promise<WebMidi.MIDIAccess>;
}
