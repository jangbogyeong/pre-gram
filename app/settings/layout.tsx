"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useMediaQuery } from "@/hooks/use-media-query"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [currentPage, setCurrentPage] = useState("Profile Settings")

  const menuItems = [
    { name: "Profile Settings", path: "/settings/profile" },
    { name: "Connected Accounts", path: "/settings/accounts" },
    { name: "Subscription", path: "/settings/subscription" },
    { name: "Preferences", path: "/settings/preferences" },
  ]

  const navigateTo = (path: string, name: string) => {
    router.push(path)
    setCurrentPage(name)
  }

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
        {isMobile ? (
          <div className="p-4 border-b">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center">
                  <span>{currentPage}</span>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full" align="start">
                {menuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    className="cursor-pointer"
                    onClick={() => navigateTo(item.path, item.name)}
                  >
                    {item.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <nav className="w-full md:w-64 border-r p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigateTo(item.path, item.name)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </nav>
        )}

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
