import type { Database } from "src/types/database.types.ts";

export type Recording = Database["public"]["Tables"]["recordings"]["Row"];
export type InsertRecording =
    Database["public"]["Tables"]["recordings"]["Insert"];
export type UpdateRecording =
    Database["public"]["Tables"]["recordings"]["Update"];

export type Piece = Database["public"]["Tables"]["pieces"]["Row"];
