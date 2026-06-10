export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      area_colaboradores: {
        Row: {
          area_id: string
          colaborador_id: string
          criado_em: string
          id: string
        }
        Insert: {
          area_id: string
          colaborador_id: string
          criado_em?: string
          id?: string
        }
        Update: {
          area_id?: string
          colaborador_id?: string
          criado_em?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "area_colaboradores_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "area_colaboradores_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          atualizado_em: string
          cor: string | null
          criado_em: string
          empresa_id: string
          icone: string | null
          id: string
          nome: string
        }
        Insert: {
          atualizado_em?: string
          cor?: string | null
          criado_em?: string
          empresa_id: string
          icone?: string | null
          id?: string
          nome: string
        }
        Update: {
          atualizado_em?: string
          cor?: string | null
          criado_em?: string
          empresa_id?: string
          icone?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          atualizado_em: string
          cnpj: string
          criado_em: string
          dono_id: string
          id: string
          nome: string
        }
        Insert: {
          atualizado_em?: string
          cnpj: string
          criado_em?: string
          dono_id: string
          id?: string
          nome: string
        }
        Update: {
          atualizado_em?: string
          cnpj?: string
          criado_em?: string
          dono_id?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      etapas_fluxograma: {
        Row: {
          atualizado_em: string
          criado_em: string
          descricao: string | null
          id: string
          ordem: number
          processo_id: string
          titulo: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          ordem: number
          processo_id: string
          titulo: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          ordem?: number
          processo_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "etapas_fluxograma_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          atualizado_em: string
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          criado_em: string
          email: string
          empresa_id: string | null
          id: string
          nome_completo: string
        }
        Insert: {
          atualizado_em?: string
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          criado_em?: string
          email: string
          empresa_id?: string | null
          id: string
          nome_completo: string
        }
        Update: {
          atualizado_em?: string
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          criado_em?: string
          email?: string
          empresa_id?: string | null
          id?: string
          nome_completo?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfis_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      processo_colaboradores: {
        Row: {
          colaborador_id: string
          criado_em: string
          id: string
          processo_id: string
        }
        Insert: {
          colaborador_id: string
          criado_em?: string
          id?: string
          processo_id: string
        }
        Update: {
          colaborador_id?: string
          criado_em?: string
          id?: string
          processo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processo_colaboradores_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processo_colaboradores_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      processos: {
        Row: {
          area_id: string
          atualizado_em: string
          criado_em: string
          id: string
          nome: string
        }
        Insert: {
          area_id: string
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome: string
        }
        Update: {
          area_id?: string
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "processos_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_current_profile: {
        Args: { full_name_input?: string; role_input?: string }
        Returns: string
      }
      can_edit_processo: {
        Args: { target_processo_id: string }
        Returns: boolean
      }
      current_empresa_id: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["cargo_usuario"]
      }
      is_member_of_empresa: {
        Args: { target_empresa_id: string }
        Returns: boolean
      }
      is_owner_of_empresa: {
        Args: { target_empresa_id: string }
        Returns: boolean
      }
    }
    Enums: {
      cargo_usuario: "dono" | "colaborador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cargo_usuario: ["dono", "colaborador"],
    },
  },
} as const
