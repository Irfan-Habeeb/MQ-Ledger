import { createClient } from '@supabase/supabase-js'

let supabase: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}



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