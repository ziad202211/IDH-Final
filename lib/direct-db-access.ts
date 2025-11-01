import { supabase } from "./supabaseClient"

/**
 * Execute SQL directly using the exec_sql function
 * This bypasses RLS policies since the function is defined with SECURITY DEFINER
 */
export async function executeSql(sql: string) {
  try {
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error executing SQL:", error)
    return { success: false, error }
  }
}

/**
 * Seed the database with sample data using direct SQL execution
 */
export async function seedDatabaseDirect() {
  try {
    // Projects
    const projectsSql = `
      INSERT INTO projects (title, category, description, featured, location, area, completed, images)
      VALUES 
        ('Harmony House', 'House', 'A beautiful modern house with harmony in design.', true, 'San Francisco, CA', '180 m²', '2023', ARRAY['/placeholder.svg?height=490&width=1176', '/placeholder.svg?height=530&width=318']),
        ('The Coffee Corner', 'Food & Beverage', 'A cozy coffee shop with modern design.', false, 'Seattle, WA', '95 m²', '2022', ARRAY['/placeholder.svg?height=490&width=1176']),
        ('Paradis Hotel', 'Hotels', 'Luxury hotel with stunning views.', true, 'Miami, FL', '2500 m²', '2021', ARRAY['/placeholder.svg?height=490&width=1176'])
      ON CONFLICT DO NOTHING;
    `

    const projectsResult = await executeSql(projectsSql)
    if (!projectsResult.success) {
      throw new Error("Failed to seed projects")
    }

    // Contact Messages
    const messagesSql = `
      INSERT INTO contact_messages (name, email, phone, message, read)
      VALUES 
        ('John Doe', 'john@example.com', '555-123-4567', 'I''m interested in your interior design services.', false),
        ('Jane Smith', 'jane@example.com', '555-987-6543', 'We''re looking to renovate our office space.', true)
      ON CONFLICT DO NOTHING;
    `

    const messagesResult = await executeSql(messagesSql)
    if (!messagesResult.success) {
      throw new Error("Failed to seed messages")
    }

    return { success: true, message: "Database seeded successfully" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, message: "Failed to seed database", error }
  }
}
