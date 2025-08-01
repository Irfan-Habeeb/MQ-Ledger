import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      accounting_entries: {
        Row: {
          id: string
          date: string
          description: string
          type: 'Income' | 'Expense'
          category: string
          amount: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          description: string
          type: 'Income' | 'Expense'
          category: string
          amount: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          description?: string
          type?: 'Income' | 'Expense'
          category?: string
          amount?: number
          created_by?: string
          created_at?: string
        }
      }
    }
  }
}