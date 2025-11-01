import { getSupabaseClient } from "./supabase"

export type ContactMessage = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  read: boolean
  created_at: string
}

export type ContactMessageInput = Omit<ContactMessage, "id" | "created_at" | "read">

// Get all messages
export const getAllMessages = async (): Promise<ContactMessage[]> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching messages:", error)
    return []
  }
}

// Get unread messages
export const getUnreadMessages = async (): Promise<ContactMessage[]> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("read", false)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching unread messages:", error)
    return []
  }
}

// Get a single message by ID
export const getMessageById = async (id: string): Promise<ContactMessage | null> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.from("contact_messages").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error fetching message with ID ${id}:`, error)
    return null
  }
}

// Create a new message
export const createMessage = async (message: ContactMessageInput): Promise<ContactMessage | null> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    // Create a new message with the correct structure
    const newMessage = {
      name: message.name,
      email: message.email,
      phone: message.phone || null,
      message: message.message,
      read: false,
    }

    const { data, error } = await supabase.from("contact_messages").insert([newMessage]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error creating message:", error)
    throw error // Re-throw to allow the UI to handle the error
  }
}

// Mark a message as read
export const markMessageAsRead = async (id: string): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { error } = await supabase.from("contact_messages").update({ read: true }).eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error marking message ${id} as read:`, error)
    return false
  }
}

// Delete a message
export const deleteMessage = async (id: string): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { error } = await supabase.from("contact_messages").delete().eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error deleting message with ID ${id}:`, error)
    return false
  }
}
