"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Instagram } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function ConnectInstagramPage() {
  const router = useRouter()
  const { user } = useAuth()

  const handleConnectInstagram = () => {
    console.log("Instagram connect requested")
    router.push("/fetch-feed") // 변경된 부분: /select에서 /fetch-feed로 변경
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <div className="w-10"></div>
        <h1 className="text-xl font-semibold">Connect Instagram</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full flex flex-col items-center"
        >
          <div className="mb-8 relative w-48 h-16">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pregram%20logo-wDnlv8EUftA6IZFH1XLM7ePNSGWTC9.png"
              alt="Pregram Logo"
              fill
              className="object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold mb-10 text-center">
            Which Instagram account would you like to preview your feed on?
          </h1>

          <Button
            size="lg"
            className="w-full max-w-xs text-lg py-6 rounded-xl flex items-center gap-2"
            onClick={handleConnectInstagram}
          >
            <Instagram className="h-5 w-5" />
            Connect Instagram Account
          </Button>
        </motion.div>
      </div>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        © 2023 Pre-gram. Not affiliated with Instagram.
      </footer>
    </div>
  )
}
