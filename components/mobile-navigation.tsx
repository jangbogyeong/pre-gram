"use client"
import { useRouter } from "next/navigation"
import { Grid, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const router = useRouter()

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around items-center py-3 px-2 z-50">
      <button
        onClick={() => handleTabClick("layouts")}
        className={cn("flex flex-col items-center", activeTab === "layouts" ? "text-primary" : "text-muted-foreground")}
      >
        <Grid className="h-6 w-6" />
        <span className="text-xs mt-1">레이아웃</span>
      </button>

      <button
        onClick={() => router.push("/settings/profile")}
        className={cn(
          "flex flex-col items-center",
          activeTab === "settings" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Settings className="h-6 w-6" />
        <span className="text-xs mt-1">설정</span>
      </button>
    </div>
  )
}
