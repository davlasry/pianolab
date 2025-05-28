export interface ChordInfo {
    root: string;
    quality: string;
    extensions: string[];
    bass?: string;
    fullName: string;
}

export const COMMON_CHORDS = [
    // Major chords
    "C", "D", "E", "F", "G", "A", "B",
    "C#", "D#", "F#", "G#", "A#",
    "Db", "Eb", "Gb", "Ab", "Bb",
    
    // Minor chords
    "Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm",
    "C#m", "D#m", "F#m", "G#m", "A#m",
    "Dbm", "Ebm", "Gbm", "Abm", "Bbm",
    
    // 7th chords
    "C7", "D7", "E7", "F7", "G7", "A7", "B7",
    "Cm7", "Dm7", "Em7", "Fm7", "Gm7", "Am7", "Bm7",
    "Cmaj7", "Dmaj7", "Emaj7", "Fmaj7", "Gmaj7", "Amaj7", "Bmaj7",
    
    // Extended chords
    "C9", "D9", "E9", "F9", "G9", "A9", "B9",
    "Cm9", "Dm9", "Em9", "Fm9", "Gm9", "Am9", "Bm9",
    "C11", "D11", "E11", "F11", "G11", "A11", "B11",
    "C13", "D13", "E13", "F13", "G13", "A13", "B13",
    
    // Altered chords
    "C7b5", "C7#5", "C7b9", "C7#9", "C7#11",
    "Cdim", "Cdim7", "Caug", "Csus2", "Csus4",
    
    // Jazz progressions
    "ii-V-I", "vi-ii-V-I", "I-vi-ii-V",
];

export const CHORD_PROGRESSIONS = {
    "Jazz Standards": [
        "Cmaj7", "Am7", "Dm7", "G7", "Em7", "A7", "Dm7", "G7"
    ],
    "Pop Progressions": [
        "C", "Am", "F", "G", "C", "G", "Am", "F"
    ],
    "Blues": [
        "C7", "C7", "C7", "C7", "F7", "F7", "C7", "C7", "G7", "F7", "C7", "G7"
    ],
    "ii-V-I": [
        "Dm7", "G7", "Cmaj7", "Cmaj7"
    ]
};

export function parseChord(chordSymbol: string): ChordInfo | null {
    if (!chordSymbol.trim()) return null;
    
    const chord = chordSymbol.trim();
    
    // Basic regex for chord parsing
    const chordRegex = /^([A-G][#b]?)(.*)$/;
    const match = chord.match(chordRegex);
    
    if (!match) return null;
    
    const [, root, remainder] = match;
    
    // Parse bass note
    const bassMatch = remainder.match(/\/([A-G][#b]?)$/);
    const bass = bassMatch?.[1];
    const chordPart = bassMatch ? remainder.replace(`/${bass}`, '') : remainder;
    
    // Determine quality and extensions
    let quality = "major";
    const extensions: string[] = [];
    
    if (chordPart.includes("m") && !chordPart.includes("maj")) {
        quality = "minor";
    } else if (chordPart.includes("dim")) {
        quality = "diminished";
    } else if (chordPart.includes("aug") || chordPart.includes("+")) {
        quality = "augmented";
    } else if (chordPart.includes("sus")) {
        quality = "suspended";
    }
    
    // Parse extensions
    if (chordPart.includes("7")) extensions.push("7th");
    if (chordPart.includes("9")) extensions.push("9th");
    if (chordPart.includes("11")) extensions.push("11th");
    if (chordPart.includes("13")) extensions.push("13th");
    if (chordPart.includes("b5")) extensions.push("♭5");
    if (chordPart.includes("#5")) extensions.push("♯5");
    if (chordPart.includes("b9")) extensions.push("♭9");
    if (chordPart.includes("#9")) extensions.push("♯9");
    if (chordPart.includes("#11")) extensions.push("♯11");
    
    return {
        root,
        quality,
        extensions,
        bass,
        fullName: chord
    };
}

export function getChordSuggestions(partial: string): string[] {
    if (!partial) return COMMON_CHORDS.slice(0, 12);
    
    const lowerPartial = partial.toLowerCase();
    return COMMON_CHORDS.filter(chord => 
        chord.toLowerCase().startsWith(lowerPartial)
    ).slice(0, 8);
}

export function getProgressionSuggestions(currentChord: string, previousChords: string[]): string[] {
    // Simple progression logic - could be enhanced with music theory
    const suggestions: string[] = [];
    
    // Use previous chords for context (basic implementation)
    const lastChord = previousChords[previousChords.length - 1];
    
    if (currentChord.includes("m7")) {
        suggestions.push(currentChord.replace("m7", "") + "7");
    }
    
    if (currentChord.includes("7") && !currentChord.includes("maj7")) {
        const root = currentChord.replace("7", "");
        suggestions.push(root + "maj7");
    }
    
    // Add context-aware suggestions based on last chord
    if (lastChord?.includes("Dm7")) {
        suggestions.unshift("G7", "Cmaj7");
    } else if (lastChord?.includes("G7")) {
        suggestions.unshift("Cmaj7", "C6");
    }
    
    // Add common progressions
    suggestions.push(...["C", "Am", "F", "G", "Dm7", "G7", "Cmaj7"]);
    
    return [...new Set(suggestions)].slice(0, 6);
} 