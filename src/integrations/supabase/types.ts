export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cogs_entries: {
        Row: {
          created_at: string
          date_from: string
          date_to: string
          id: string
          marketplace: string
          marketplace_article: string | null
          subject: string | null
          supplier_article: string | null
          unit_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_from?: string
          date_to?: string
          id?: string
          marketplace: string
          marketplace_article?: string | null
          subject?: string | null
          supplier_article?: string | null
          unit_cost: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_from?: string
          date_to?: string
          id?: string
          marketplace?: string
          marketplace_article?: string | null
          subject?: string | null
          supplier_article?: string | null
          unit_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      cost_data: {
        Row: {
          created_at: string
          file_name: string
          id: string
          status: string
          total_amount: number
          upload_date: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          status?: string
          total_amount?: number
          upload_date?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          status?: string
          total_amount?: number
          upload_date?: string
        }
        Relationships: []
      }
      expense_journal: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          is_tax_deductible: boolean
          marketplace: string | null
          receipt_url: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          is_tax_deductible?: boolean
          marketplace?: string | null
          receipt_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          is_tax_deductible?: boolean
          marketplace?: string | null
          receipt_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_connections: {
        Row: {
          created_at: string
          id: string
          is_connected: boolean
          marketplace: string
          user_api_key: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_connected?: boolean
          marketplace: string
          user_api_key?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_connected?: boolean
          marketplace?: string
          user_api_key?: string | null
        }
        Relationships: []
      }
      payment_journal: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          id: string
          invoice_number: string | null
          marketplace: string | null
          payment_date: string
          payment_method: string
          payment_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          id?: string
          invoice_number?: string | null
          marketplace?: string | null
          payment_date?: string
          payment_method: string
          payment_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          invoice_number?: string | null
          marketplace?: string | null
          payment_date?: string
          payment_method?: string
          payment_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          date_from: string
          date_to: string
          file_url: string | null
          id: string
          marketplace: string | null
          report_name: string
          report_type: string
          status: string
        }
        Insert: {
          created_at?: string
          date_from: string
          date_to: string
          file_url?: string | null
          id?: string
          marketplace?: string | null
          report_name: string
          report_type: string
          status?: string
        }
        Update: {
          created_at?: string
          date_from?: string
          date_to?: string
          file_url?: string | null
          id?: string
          marketplace?: string | null
          report_name?: string
          report_type?: string
          status?: string
        }
        Relationships: []
      }
      sales_data: {
        Row: {
          created_at: string
          id: string
          marketplace: string
          orders_count: number
          products_count: number
          profit: number
          revenue: number
          sale_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          marketplace: string
          orders_count?: number
          products_count?: number
          profit?: number
          revenue?: number
          sale_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          marketplace?: string
          orders_count?: number
          products_count?: number
          profit?: number
          revenue?: number
          sale_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_sync: boolean
          created_at: string
          email_notifications: boolean
          id: string
          sync_frequency_hours: number
          updated_at: string
        }
        Insert: {
          auto_sync?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          sync_frequency_hours?: number
          updated_at?: string
        }
        Update: {
          auto_sync?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          sync_frequency_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
