"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context" // Use our custom auth hook

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth() // Use our custom auth hook

  useEffect(() => {
    // Wait until auth state is determined, then redirect appropriately
    if (!isLoading) {
      if (user) {
        router.push("/instagram/connect")
      } else {
        router.push("/login")
      }
    }
  }, [router, isLoading, user])

  // Show loading indicator while determining auth state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}
