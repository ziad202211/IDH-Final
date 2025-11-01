import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED AUTH CHECKS TO FIX REDIRECT LOOP
  // Just pass through all requests while we debug the client-side auth
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*"],
}
