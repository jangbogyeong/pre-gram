"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        <ModeToggle />
      </header>

      <div className="flex flex-1 md:flex-row flex-col">
        <nav className="w-full md:w-64 border-r p-4">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/settings/profile")}>
              Profile Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/settings/accounts")}>
              Connected Accounts
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/settings/subscription")}
            >
              Subscription
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/settings/preferences")}
            >
              Preferences
            </Button>
          </div>
        </nav>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
