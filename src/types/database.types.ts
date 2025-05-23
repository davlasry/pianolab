export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            annotations: {
                Row: {
                    id: string;
                    recording_id: string | null;
                    text: string | null;
                    time: number | null;
                };
                Insert: {
                    id?: string;
                    recording_id?: string | null;
                    text?: string | null;
                    time?: number | null;
                };
                Update: {
                    id?: string;
                    recording_id?: string | null;
                    text?: string | null;
                    time?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "annotations_recording_id_fkey";
                        columns: ["recording_id"];
                        isOneToOne: false;
                        referencedRelation: "recordings";
                        referencedColumns: ["id"];
                    },
                ];
            };
            cadences: {
                Row: {
                    end_time: number | null;
                    id: string;
                    key: string | null;
                    recording_id: string | null;
                    start_time: number | null;
                    type: string | null;
                };
                Insert: {
                    end_time?: number | null;
                    id?: string;
                    key?: string | null;
                    recording_id?: string | null;
                    start_time?: number | null;
                    type?: string | null;
                };
                Update: {
                    end_time?: number | null;
                    id?: string;
                    key?: string | null;
                    recording_id?: string | null;
                    start_time?: number | null;
                    type?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "cadences_recording_id_fkey";
                        columns: ["recording_id"];
                        isOneToOne: false;
                        referencedRelation: "recordings";
                        referencedColumns: ["id"];
                    },
                ];
            };
            pieces: {
                Row: {
                    composer: string | null;
                    created_at: string | null;
                    id: string;
                    name: string;
                    style: string | null;
                    tags: string[] | null;
                };
                Insert: {
                    composer?: string | null;
                    created_at?: string | null;
                    id?: string;
                    name: string;
                    style?: string | null;
                    tags?: string[] | null;
                };
                Update: {
                    composer?: string | null;
                    created_at?: string | null;
                    id?: string;
                    name?: string;
                    style?: string | null;
                    tags?: string[] | null;
                };
                Relationships: [];
            };
            recording_pieces: {
                Row: {
                    piece_id: string;
                    recording_id: string;
                };
                Insert: {
                    piece_id: string;
                    recording_id: string;
                };
                Update: {
                    piece_id?: string;
                    recording_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "recording_pieces_piece_id_fkey";
                        columns: ["piece_id"];
                        isOneToOne: false;
                        referencedRelation: "pieces";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "recording_pieces_recording_id_fkey";
                        columns: ["recording_id"];
                        isOneToOne: false;
                        referencedRelation: "recordings";
                        referencedColumns: ["id"];
                    },
                ];
            };
            recordings: {
                Row: {
                    audio_url: string | null;
                    chords: Json | null;
                    created_at: string | null;
                    id: string;
                    key: string | null;
                    midi_url: string | null;
                    name: string | null;
                    performer: string | null;
                };
                Insert: {
                    audio_url?: string | null;
                    chords?: Json | null;
                    created_at?: string | null;
                    id?: string;
                    key?: string | null;
                    midi_url?: string | null;
                    name?: string | null;
                    performer?: string | null;
                };
                Update: {
                    audio_url?: string | null;
                    chords?: Json | null;
                    created_at?: string | null;
                    id?: string;
                    key?: string | null;
                    midi_url?: string | null;
                    name?: string | null;
                    performer?: string | null;
                };
                Relationships: [];
            };
            techniques: {
                Row: {
                    id: string;
                    name: string | null;
                    notes: string | null;
                    recording_id: string | null;
                    time: number | null;
                };
                Insert: {
                    id?: string;
                    name?: string | null;
                    notes?: string | null;
                    recording_id?: string | null;
                    time?: number | null;
                };
                Update: {
                    id?: string;
                    name?: string | null;
                    notes?: string | null;
                    recording_id?: string | null;
                    time?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "techniques_recording_id_fkey";
                        columns: ["recording_id"];
                        isOneToOne: false;
                        referencedRelation: "recordings";
                        referencedColumns: ["id"];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {},
    },
} as const;
