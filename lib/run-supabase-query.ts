import { supabase } from "@/lib/supabase"
import { resetAndCreateTablesQuery } from "@/lib/supabase-schema"

export async function resetAndCreateTables() {
  try {
    const { error } = await supabase.rpc("exec_sql", { sql: resetAndCreateTablesQuery })

    if (error) {
      throw error
    }

    return { success: true, message: "Database tables reset and recreated successfully" }
  } catch (error) {
    console.error("Error resetting database:", error)
    return { success: false, message: "Failed to reset database", error }
  }
}
