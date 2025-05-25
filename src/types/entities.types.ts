import type { Database } from "src/types/database.types.ts";

export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type RecordingWithPieces = Session & {
    session_pieces: Array<{
        pieces: Piece;
    }>;
};
export type InsertRecording =
    Database["public"]["Tables"]["sessions"]["Insert"];
export type UpdateRecording =
    Database["public"]["Tables"]["sessions"]["Update"];

export type Piece = Database["public"]["Tables"]["pieces"]["Row"];
export type InsertPiece = Database["public"]["Tables"]["pieces"]["Insert"];
