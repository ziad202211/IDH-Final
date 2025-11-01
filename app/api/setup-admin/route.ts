import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Create a Supabase admin client with the service role key
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 200 })
    }

    // Create the user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
    })

    if (error) {
      console.error("Error creating admin user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Admin user created successfully", userId: data.user.id }, { status: 201 })
  } catch (error: any) {
    console.error("Error in setup-admin API:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}
