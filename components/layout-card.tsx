"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Copy, Trash, Loader2 } from "lucide-react"
import FeedGrid from "@/components/feed-grid"
import ReelsGrid from "@/components/reels-grid"
import type { ImageItem } from "@/contexts/project-context"
import { v4 as uuidv4 } from "uuid"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface LayoutCardProps {
  id: string
  index: number
  type: "feed" | "reels"
  images: ImageItem[]
  onReorder: (layoutId: string, reorderedImages: ImageItem[]) => void
  onRemoveImage: (layoutId: string, imageId: string) => void
  onDuplicate: (layoutId: string) => void
  onDelete: (layoutId: string) => void
  onAddImages: (layoutId: string, images: ImageItem[]) => void
}

export default function LayoutCard({
  id,
  index,
  type,
  images,
  onReorder,
  onRemoveImage,
  onDuplicate,
  onDelete,
  onAddImages,
}: LayoutCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localImages, setLocalImages] = useState<ImageItem[]>([])
  const { toast } = useToast()

  // 외부에서 받은 이미지 배열로 내부 상태 업데이트
  useEffect(() => {
    console.log(`LayoutCard ${id}: Received ${images.length} images`)
    setLocalImages(images)
  }, [id, images])

  // 파일 선택 핸들러 - 완전히 새로 작성
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.log("No files selected")
      return
    }

    setIsLoading(true)
    const files = Array.from(e.target.files)
    console.log(`Selected ${files.length} files:`, files.map((f) => f.name).join(", "))

    try {
      // 이미지 파일만 필터링
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))

      if (imageFiles.length === 0) {
        toast({
          title: "이미지 파일만 업로드 가능합니다",
          description: "JPG, PNG, GIF 등의 이미지 파일을 선택해주세요.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // 이미지 처리를 위한 배열
      const processedImages: ImageItem[] = []

      // 각 이미지 파일 처리
      for (const file of imageFiles) {
        const imageData = await processImageFile(file)
        processedImages.push(imageData)
      }

      console.log(`Processed ${processedImages.length} images for layout ${id}`)

      // 로컬 상태 업데이트
      const updatedImages = [...processedImages, ...localImages]
      setLocalImages(updatedImages)

      // 부모 컴포넌트에 알림
      onAddImages(id, processedImages)

      // 성공 메시지
      toast({
        title: "이미지 추가 완료",
        description: `${processedImages.length}개의 이미지가 추가되었습니다.`,
      })
    } catch (error) {
      console.error("Error processing images:", error)
      toast({
        title: "이미지 처리 중 오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // 이미지 파일 처리 함수
  const processImageFile = (file: File): Promise<ImageItem> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== "string") {
          reject(new Error(`Failed to read file: ${file.name}`))
          return
        }

        const dataUrl = event.target.result

        // 이미지 크기 가져오기
        const img = new Image()
        img.onload = () => {
          resolve({
            id: uuidv4(),
            src: dataUrl,
            file: file,
            width: img.width,
            height: img.height,
            isUserUploaded: true,
          })
        }

        img.onerror = () => {
          reject(new Error(`Failed to load image: ${file.name}`))
        }

        img.src = dataUrl
      }

      reader.onerror = () => {
        reject(new Error(`Error reading file: ${file.name}`))
      }

      reader.readAsDataURL(file)
    })
  }

  const handleDuplicate = () => {
    setIsDuplicating(true)
    // 시각적 피드백을 위한 짧은 지연
    setTimeout(() => {
      onDuplicate(id)
      setIsDuplicating(false)
    }, 300)
  }

  const handleDelete = () => {
    setIsDeleting(true)
    // 시각적 피드백을 위한 짧은 지연
    setTimeout(() => {
      onDelete(id)
    }, 300)
  }

  const handleAddImages = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // 이미지 재정렬 핸들러
  const handleReorder = (reorderedImages: ImageItem[]) => {
    console.log(`Reordering images in layout ${id}`)
    setLocalImages(reorderedImages)
    onReorder(id, reorderedImages)
  }

  // 이미지 제거 핸들러
  const handleRemoveImage = useCallback(
    (imageId: string) => {
      console.log("LayoutCard: Removing image", imageId, "from layout", id)

      // 로컬 상태 즉시 업데이트
      setLocalImages((prev) => prev.filter((img) => img.id !== imageId))

      // 부모 컴포넌트에 알림
      onRemoveImage(id, imageId)
    },
    [id, onRemoveImage],
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="min-w-[300px] w-[300px] flex-shrink-0 snap-start"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Layout {index + 1}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleAddImages}
            title="Add Images"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${isDuplicating ? "animate-pulse" : ""}`}
            onClick={handleDuplicate}
            title="Duplicate Layout"
            disabled={isDuplicating || isLoading}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 text-destructive hover:text-destructive ${isDeleting ? "animate-pulse" : ""}`}
            onClick={handleDelete}
            title="Delete Layout"
            disabled={isDeleting || isLoading}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <motion.div
        animate={{
          scale: isDuplicating ? 0.95 : 1,
          opacity: isDeleting ? 0.5 : 1,
        }}
        className="bg-white dark:bg-black rounded-lg overflow-hidden shadow-md"
      >
        <div className="p-3 border-b flex items-center">
          <div className="w-7 h-7 rounded-full bg-muted mr-2"></div>
          <span className="text-sm font-medium">your_username</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {type === "feed" ? (
            <FeedGrid images={localImages} onReorder={handleReorder} onRemoveImage={handleRemoveImage} />
          ) : (
            <ReelsGrid images={localImages} onReorder={handleReorder} onRemoveImage={handleRemoveImage} />
          )}
        </div>

        {/* 이미지가 없을 때 업로드 버튼 표시 */}
        {localImages.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/10">
            <Button variant="outline" onClick={handleAddImages} className="mb-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  이미지 추가
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Upload images to see how they'll look in your feed
            </p>
          </div>
        )}
      </motion.div>
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
    </motion.div>
  )
}
