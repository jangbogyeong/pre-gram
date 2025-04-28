"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/layout/page-container"
import { Header } from "@/components/layout/header"
import { Eye, Upload } from "lucide-react"
import { ImageGrid } from "@/components/image-grid"
import { motion } from "framer-motion"

export default function EditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = "feed" // 항상 feed 타입으로 고정

  return (
    <PageContainer header={<Header showBackButton onBackClick={() => router.push("/select")} title="Feed Layout" />}>
      <div className="flex-1 flex flex-col p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto w-full"
        >
          <div className="bg-muted/30 rounded-xl p-4 mb-6 min-h-[400px] flex items-center justify-center">
            <ImageGrid type="feed" />
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
