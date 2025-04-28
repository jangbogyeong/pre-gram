"use client"

import { useRouter } from "next/navigation"
import { useProject } from "@/contexts/project-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Grid, Video, LogOut } from "lucide-react"
import { motion } from "framer-motion"

export default function SelectPage() {
  const router = useRouter()
  const { createProject } = useProject()
  const { user, logout } = useAuth()

  const handleSelect = (type: "feed" | "reels") => {
    const newProject = createProject(type)
    router.push(`/editor?type=${type}&id=${newProject.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium">Welcome, {user?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <h1 className="text-2xl font-bold mb-10 text-center">What would you like to preview?</h1>

          <div className="space-y-6">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="transition-all">
              <Button
                variant="outline"
                className="w-full p-8 flex flex-col items-center justify-center gap-4 h-auto border-2 rounded-xl hover:bg-primary/5 hover:border-primary/30"
                onClick={() => handleSelect("feed")}
              >
                <Grid className="h-12 w-12 text-blue-500" />
                <div>
                  <h2 className="text-xl font-semibold">Feed 탭 구성하기</h2>
                  <p className="text-muted-foreground mt-1">Square grid layout for your profile</p>
                </div>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="transition-all">
              <Button
                variant="outline"
                className="w-full p-8 flex flex-col items-center justify-center gap-4 h-auto border-2 rounded-xl hover:bg-primary/5 hover:border-primary/30"
                onClick={() => handleSelect("reels")}
              >
                <Video className="h-12 w-12 text-red-500" />
                <div>
                  <h2 className="text-xl font-semibold">Reels 탭 구성하기</h2>
                  <p className="text-muted-foreground mt-1">Vertical layout for Reels content</p>
                </div>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        © 2023 Pre-gram. Not affiliated with Instagram.
      </footer>
    </div>
  )
}
