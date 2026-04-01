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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      challenge_action_completions: {
        Row: {
          challenge_action_id: string
          completed_at: string
          created_at: string
          id: string
          status: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          challenge_action_id: string
          completed_at?: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          challenge_action_id?: string
          completed_at?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_action_completions_challenge_action_id_fkey"
            columns: ["challenge_action_id"]
            isOneToOne: false
            referencedRelation: "challenge_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_actions: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          label: string
          moment_id: string | null
          points: number
          week_number: number
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          label: string
          moment_id?: string | null
          points?: number
          week_number: number
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          label?: string
          moment_id?: string | null
          points?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_actions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_assignments: {
        Row: {
          assigned_at: string
          challenge_id: string
          completed_at: string | null
          id: string
          status: string | null
          team_id: string | null
          user_id: string | null
          xp_earned: number | null
        }
        Insert: {
          assigned_at?: string
          challenge_id: string
          completed_at?: string | null
          id?: string
          status?: string | null
          team_id?: string | null
          user_id?: string | null
          xp_earned?: number | null
        }
        Update: {
          assigned_at?: string
          challenge_id?: string
          completed_at?: string | null
          id?: string
          status?: string | null
          team_id?: string | null
          user_id?: string | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_assignments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          organization_id: string
          start_date: string | null
          status: string
          title: string
          xp_reward: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id: string
          start_date?: string | null
          status?: string
          title: string
          xp_reward?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string
          start_date?: string | null
          status?: string
          title?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          challenge_id: string | null
          completed_actions: Json | null
          created_at: string
          id: string
          note: string | null
          organization_id: string
          user_id: string
          week_number: number | null
        }
        Insert: {
          challenge_id?: string | null
          completed_actions?: Json | null
          created_at?: string
          id?: string
          note?: string | null
          organization_id: string
          user_id: string
          week_number?: number | null
        }
        Update: {
          challenge_id?: string | null
          completed_actions?: Json | null
          created_at?: string
          id?: string
          note?: string | null
          organization_id?: string
          user_id?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_accounts: {
        Row: {
          created_at: string
          demo_environment: string
          enabled: boolean
          id: string
          last_used_at: string | null
          login: string
          password_hash: string
        }
        Insert: {
          created_at?: string
          demo_environment?: string
          enabled?: boolean
          id?: string
          last_used_at?: string | null
          login: string
          password_hash: string
        }
        Update: {
          created_at?: string
          demo_environment?: string
          enabled?: boolean
          id?: string
          last_used_at?: string | null
          login?: string
          password_hash?: string
        }
        Relationships: []
      }
      feedback_entries: {
        Row: {
          challenge_id: string | null
          content: string | null
          created_at: string
          id: string
          organization_id: string
          rating: number | null
          type: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          organization_id: string
          rating?: number | null
          type?: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          rating?: number | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          team_id: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status?: string
          team_id?: string | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          team_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_metrics: {
        Row: {
          id: string
          metric_key: string
          metric_value: number | null
          organization_id: string
          period: string | null
          recorded_at: string
        }
        Insert: {
          id?: string
          metric_key: string
          metric_value?: number | null
          organization_id: string
          period?: string | null
          recorded_at?: string
        }
        Update: {
          id?: string
          metric_key?: string
          metric_value?: number | null
          organization_id?: string
          period?: string | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          id: string
          level: string
          organization_id: string
          streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          id?: string
          level?: string
          organization_id: string
          streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          id?: string
          level?: string
          organization_id?: string
          streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          module_title: string | null
          organization_id: string
          request_type: string
          requester_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          module_title?: string | null
          organization_id: string
          request_type?: string
          requester_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          module_title?: string | null
          organization_id?: string
          request_type?: string
          requester_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_challenge: {
        Args: { _challenge_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_challenge_action: {
        Args: { _challenge_action_id: string; _user_id: string }
        Returns: boolean
      }
      get_invite_info: { Args: { _token: string }; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      needs_bootstrap: { Args: never; Returns: boolean }
      remove_org_member: {
        Args: { _admin_id: string; _member_id: string }
        Returns: undefined
      }
      shares_team_with: {
        Args: { _target_id: string; _viewer_id: string }
        Returns: boolean
      }
      user_org_id: { Args: { _user_id: string }; Returns: string }
      user_team_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "manager" | "collaborator" | "sponsor"
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
      app_role: ["admin", "manager", "collaborator", "sponsor"],
    },
  },
} as const
