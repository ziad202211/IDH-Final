import { createClient } from "@supabase/supabase-js"

export async function createAdminUser() {
  // This function should be run server-side only
  if (typeof window !== "undefined") {
    throw new Error("This function should only be run on the server")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials")
  }

  // Create a Supabase client with the service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Default admin credentials - in a real app, you'd want to make this configurable
  const adminEmail = "admin@example.com"
  const adminPassword = "Admin123!" // This should be more secure in a real app

  try {
    // Check if the user already exists
    const { data: existingUsers, error: searchError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle()

    if (searchError) {
      console.error("Error checking for existing user:", searchError)
    }

    // If the user doesn't exist, create them
    if (!existingUsers) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm the email
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        message: `Admin user created with email: ${adminEmail}`,
        credentials: {
          email: adminEmail,
          password: adminPassword,
        },
      }
    }

    return {
      success: true,
      message: `Admin user already exists with email: ${adminEmail}`,
      credentials: {
        email: adminEmail,
        password: "Use your existing password",
      },
    }
  } catch (error) {
    console.error("Error creating admin user:", error)
    return {
      success: false,
      message: `Failed to create admin user: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
