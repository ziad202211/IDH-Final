export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          category: string
          description: string
          featured: boolean
          location: string | null
          area: string | null
          completed: string | null
          images: string[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          description: string
          featured?: boolean
          location?: string | null
          area?: string | null
          completed?: string | null
          images: string[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          description?: string
          featured?: boolean
          location?: string | null
          area?: string | null
          completed?: string | null
          images?: string[]
          created_at?: string
        }
      }
    }
  }
}
