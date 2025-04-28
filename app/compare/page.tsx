"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProject } from "@/contexts/project-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowLeft, Copy } from "lucide-react"
import FeedGrid from "@/components/feed-grid"
import ReelsGrid from "@/components/reels-grid"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import type { ImageItem } from "@/contexts/project-context"

export default function ComparePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { projects, setCompareProjects, compareProjects, reorderImages, removeImage } = useProject()
  const { toast } = useToast()
  const initializedRef = useRef(false)

  const originalId = searchParams.get("original")
  const duplicateId = searchParams.get("duplicate")

  // 무한 루프 방지를 위해 useRef로 초기화 여부 체크
  useEffect(() => {
    if (initializedRef.current) return

    if (originalId && duplicateId) {
      const original = projects.find((p) => p.id === originalId) || null
      const duplicate = projects.find((p) => p.id === duplicateId) || null

      if (original && duplicate) {
        setCompareProjects(original, duplicate)
        initializedRef.current = true
      } else {
        toast({
          title: "Projects not found",
          description: "One or both projects could not be found.",
          variant: "destructive",
        })
        router.push("/select")
      }
    }
  }, [originalId, duplicateId, projects, setCompareProjects, router, toast])

  // 이미지 정렬 함수: 사용자 업로드 이미지를 먼저 표시
  const getSortedImages = (images: ImageItem[]) => {
    // 사용자가 업로드한 이미지와 기존 피드 이미지 분리
    const userUploaded = images.filter((img) => img.isUserUploaded)
    const existingFeed = images.filter((img) => !img.isUserUploaded)

    // 사용자 업로드 이미지를 먼저, 기존 피드 이미지를 나중에 합침
    return [...userUploaded, ...existingFeed]
  }

  const handleReorder = (reorderedImages: ImageItem[]) => {
    if (compareProjects.duplicate) {
      reorderImages(compareProjects.duplicate.id, reorderedImages)
    }
  }

  const handleRemoveImage = (imageId: string) => {
    if (compareProjects.duplicate) {
      // 이미지가 사용자 업로드 이미지인지 확인
      const imageToRemove = compareProjects.duplicate.images.find((img) => img.id === imageId)

      if (imageToRemove && imageToRemove.isUserUploaded) {
        removeImage(compareProjects.duplicate.id, imageId)
      } else {
        // 기존 피드 이미지는 삭제할 수 없음을 알림
        toast({
          title: "Cannot remove existing feed image",
          description: "Only your uploaded images can be removed.",
          variant: "destructive",
        })
      }
    }
  }

  const handleBackToEdit = () => {
    if (compareProjects.duplicate) {
      router.push(`/editor?type=${compareProjects.duplicate.type}&id=${compareProjects.duplicate.id}`)
    } else {
      router.push("/select")
    }
  }

  const handleNewComparison = () => {
    router.push("/select")
  }

  if (!compareProjects.original || !compareProjects.duplicate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 정렬된 이미지 가져오기
  const sortedOriginalImages = getSortedImages(compareProjects.original.images)
  const sortedDuplicateImages = getSortedImages(compareProjects.duplicate.images)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={handleBackToEdit}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">Compare Layouts</h1>
        <ModeToggle />
      </header>

      <div className="flex-1 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium">{compareProjects.original.name}</h2>
              </div>
              <div className="bg-white dark:bg-black rounded-lg overflow-hidden shadow-md">
                <div className="p-3 border-b flex items-center">
                  <div className="w-7 h-7 rounded-full bg-muted mr-2"></div>
                  <span className="text-sm font-medium">your_username</span>
                </div>

                {compareProjects.original.type === "feed" ? (
                  <FeedGrid
                    images={sortedOriginalImages}
                    onReorder={() => {}}
                    onRemoveImage={() => {}}
                    readOnly={true}
                  />
                ) : (
                  <ReelsGrid
                    images={sortedOriginalImages}
                    onReorder={() => {}}
                    onRemoveImage={() => {}}
                    readOnly={true}
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium">{compareProjects.duplicate.name}</h2>
              </div>
              <div className="bg-white dark:bg-black rounded-lg overflow-hidden shadow-md">
                <div className="p-3 border-b flex items-center">
                  <div className="w-7 h-7 rounded-full bg-muted mr-2"></div>
                  <span className="text-sm font-medium">your_username</span>
                </div>

                {compareProjects.duplicate.type === "feed" ? (
                  <FeedGrid
                    images={sortedDuplicateImages}
                    onReorder={handleReorder}
                    onRemoveImage={handleRemoveImage}
                  />
                ) : (
                  <ReelsGrid
                    images={sortedDuplicateImages}
                    onReorder={handleReorder}
                    onRemoveImage={handleRemoveImage}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="p-4 border-t">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={handleBackToEdit} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Button>
          <Button onClick={handleNewComparison} className="gap-2">
            <Copy className="h-4 w-4" />
            New Comparison
          </Button>
        </div>
      </footer>
    </div>
  )
}
