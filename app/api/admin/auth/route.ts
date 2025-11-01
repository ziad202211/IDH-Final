import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { checkAdminAccess } from "@/lib/actions/auth-actions"

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const email = session.user.email

    if (!email) {
      return NextResponse.json({ success: false, message: "User email not found" }, { status: 400 })
    }

    const { success, isAdmin, message } = await checkAdminAccess(email)

    if (!success) {
      return NextResponse.json({ success: false, message }, { status: 500 })
    }

    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin access verified",
      user: {
        id: session.user.id,
        email: session.user.email,
      },
    })
  } catch (error) {
    console.error("Error in admin auth route:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
