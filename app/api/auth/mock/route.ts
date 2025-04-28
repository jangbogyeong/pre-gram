import { NextResponse } from "next/server"

// This is a mock auth endpoint for development purposes
export async function GET() {
  return NextResponse.json({
    user: {
      name: "Test User",
      email: "test@example.com",
      image: null,
    },
  })
}
