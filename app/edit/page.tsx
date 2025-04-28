"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/layout/page-container"
import { Header } from "@/components/layout/header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Upload } from "lucide-react"
import { ImageGrid } from "@/components/image-grid"
import { motion } from "framer-motion"

export default function EditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") || "feed"
  const [type, setType] = useState<"feed" | "reels">(initialType as "feed" | "reels")

  return (
    <PageContainer
      header={
        <Header
          showBackButton
          onBackClick={() => router.push("/select")}
          title={type === "feed" ? "Feed Layout" : "Reels Layout"}
        />
      }
    >
      <div className="flex-1 flex flex-col p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto w-full"
        >
          <Tabs
            defaultValue={type}
            onValueChange={(value) => setType(value as "feed" | "reels")}
            className="w-full mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed" className="text-lg py-3">
                Feed
              </TabsTrigger>
              <TabsTrigger value="reels" className="text-lg py-3">
                Reels
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="bg-muted/30 rounded-xl p-4 mb-6 min-h-[400px] flex items-center justify-center">
            <ImageGrid type={type} />
          </div>
        </motion.div>
      </div>

      <footer className="p-4 border-t">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button size="lg" className="rounded-xl gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </Button>
          <Button size="lg" className="rounded-xl gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </Button>
        </div>
      </footer>
    </PageContainer>
  )
}
