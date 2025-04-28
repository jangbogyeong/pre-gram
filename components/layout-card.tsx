"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Copy, Trash, Loader2 } from "lucide-react"
import FeedGrid from "@/components/feed-grid"
import ReelsGrid from "@/components/reels-grid"
import type { ImageItem } from "@/contexts/project-context"
import { v4 as uuidv4 } from "uuid"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { generateDummyFeedImages } from "@/utils/dummy-data"

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

// 레이아웃 카드 헤더 컴포넌트
const LayoutCardHeader = memo(function LayoutCardHeader({
  index,
  onAddImages,
  onDuplicate,
  onDelete,
  isLoading,
  isDuplicating,
  isDeleting,
}: {
  index: number
  onAddImages: () => void
  onDuplicate: () => void
  onDelete: () => void
  isLoading: boolean
  isDuplicating: boolean
  isDeleting: boolean
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm font-medium">Layout {index + 1}</span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onAddImages}
          title="Add Images"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${isDuplicating ? "animate-pulse" : ""}`}
          onClick={onDuplicate}
          title="Duplicate Layout"
          disabled={isDuplicating || isLoading}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 text-destructive hover:text-destructive ${isDeleting ? "animate-pulse" : ""}`}
          onClick={onDelete}
          title="Delete Layout"
          disabled={isDeleting || isLoading}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

// 레이아웃 카드 컨텐츠 컴포넌트
const LayoutCardContent = memo(function LayoutCardContent({
  type,
  images,
  onReorder,
  onRemoveImage,
  isLoading,
  onAddImages,
}: {
  type: "feed" | "reels"
  images: ImageItem[]
  onReorder: (images: ImageItem[]) => void
  onRemoveImage: (id: string) => void
  isLoading: boolean
  onAddImages: () => void
}) {
  return (
    <motion.div className="bg-white dark:bg-black rounded-lg overflow-hidden shadow-md">
      <div className="p-3 border-b flex items-center">
        <div className="w-7 h-7 rounded-full bg-muted mr-2"></div>
        <span className="text-sm font-medium">your_username</span>
      </div>

      <div className="flex-1 overflow-hidden">
        {type === "feed" ? (
          <FeedGrid images={images} onReorder={onReorder} onRemoveImage={onRemoveImage} />
        ) : (
          <ReelsGrid images={images} onReorder={onReorder} onRemoveImage={onRemoveImage} />
        )}
      </div>

      {/* 이미지가 전혀 없을 때만 업로드 버튼 표시 */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/10">
          <Button variant="outline" onClick={onAddImages} className="mb-2" disabled={isLoading}>
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
  )
})

// Optimize the main component with better state management
function LayoutCard({
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
  const prevImagesRef = useRef<ImageItem[]>([])
  const { toast } = useToast()
  const dummyImagesAddedRef = useRef(false)
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)

  // Use a ref to track local images instead of state to prevent unnecessary re-renders
  const localImagesRef = useRef<ImageItem[]>([])

  // Only update local images when the images prop actually changes
  useEffect(() => {
    const imagesChanged =
      images.length !== prevImagesRef.current.length ||
      JSON.stringify(images.map((img) => img.id)) !== JSON.stringify(prevImagesRef.current.map((img) => img.id))

    if (imagesChanged) {
      prevImagesRef.current = images
      localImagesRef.current = images

      // If no images and dummy images not added yet, add dummy images
      if (images.length === 0 && !dummyImagesAddedRef.current) {
        const dummyImages = generateDummyFeedImages(9)
        localImagesRef.current = dummyImages
        dummyImagesAddedRef.current = true

        // Notify parent of dummy images
        requestAnimationFrame(() => {
          onAddImages(id, dummyImages)
        })
      }
    }
  }, [id, images, onAddImages])

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
    }
  }, [])

  // File selection handler with optimized processing
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event?.target?.files?.length || isLoading) return

      setIsLoading(true)
      const fileArray = Array.from(event.target.files)

      try {
        const imageFiles = fileArray.filter((file) => file.type.startsWith("image/"))

        if (imageFiles.length === 0) {
          setIsLoading(false)
          if (fileInputRef.current) fileInputRef.current.value = ""
          return
        }

        // Process images in batches to prevent UI freezing
        const processImages = async () => {
          const processedImages: ImageItem[] = []

          for (const file of imageFiles) {
            try {
              const image = await processImageFile(file)
              processedImages.push(image)
            } catch (error) {
              console.error("Error processing image:", error)
            }

            // Allow UI to update every few images
            if (processedImages.length % 3 === 0) {
              await new Promise((resolve) => requestAnimationFrame(resolve))
            }
          }

          return processedImages
        }

        processImages().then((processedImages) => {
          if (processedImages.length === 0) {
            setIsLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
          }

          // Update local images reference
          const userUploadedImages = localImagesRef.current.filter((img) => img.isUserUploaded === true)
          const existingFeedImages = localImagesRef.current.filter((img) => img.isUserUploaded !== true)
          localImagesRef.current = [...processedImages, ...userUploadedImages, ...existingFeedImages]

          // Notify parent component
          requestAnimationFrame(() => {
            onAddImages(id, processedImages)
            setIsLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
          })
        })
      } catch (error) {
        console.error("Error processing images:", error)
        setIsLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    },
    [id, isLoading, onAddImages],
  )

  // Other handlers with optimized performance
  const handleDuplicate = useCallback(() => {
    if (isDuplicating) return
    setIsDuplicating(true)

    requestAnimationFrame(() => {
      processingTimeoutRef.current = setTimeout(() => {
        onDuplicate(id)
        setIsDuplicating(false)
      }, 300)
    })
  }, [id, onDuplicate, isDuplicating])

  const handleDelete = useCallback(() => {
    if (isDeleting) return
    setIsDeleting(true)

    requestAnimationFrame(() => {
      processingTimeoutRef.current = setTimeout(() => {
        onDelete(id)
      }, 300)
    })
  }, [id, onDelete, isDeleting])

  const handleAddImages = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  // Optimized handlers for reordering and removing images
  const handleReorder = useCallback(
    (reorderedImages: ImageItem[]) => {
      // Update local reference first
      localImagesRef.current = reorderedImages

      // Notify parent with slight delay to prevent UI jank
      requestAnimationFrame(() => {
        onReorder(id, reorderedImages)
      })
    },
    [id, onReorder],
  )

  const handleRemoveImage = useCallback(
    (imageId: string) => {
      // Update local reference first
      localImagesRef.current = localImagesRef.current.filter((img) => img.id !== imageId)

      // Notify parent with slight delay to prevent UI jank
      requestAnimationFrame(() => {
        onRemoveImage(id, imageId)
      })
    },
    [id, onRemoveImage],
  )

  // Use the current value from the ref for rendering
  const currentImages = localImagesRef.current.length > 0 ? localImagesRef.current : images

  const processImageFileMemoized = useCallback(processImageFile, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="min-w-[300px] w-[300px] flex-shrink-0 snap-start"
      layout={false} // Disable layout animations to prevent flickering
    >
      <LayoutCardHeader
        index={index}
        onAddImages={handleAddImages}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        isLoading={isLoading}
        isDuplicating={isDuplicating}
        isDeleting={isDeleting}
      />

      <motion.div
        animate={{
          scale: isDuplicating ? 0.95 : 1,
          opacity: isDeleting ? 0.5 : 1,
        }}
        transition={{ duration: 0.2 }}
        layout={false} // Disable layout animations to prevent flickering
      >
        <LayoutCardContent
          type={type}
          images={currentImages}
          onReorder={handleReorder}
          onRemoveImage={handleRemoveImage}
          isLoading={isLoading}
          onAddImages={handleAddImages}
        />
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

// 이미지 파일 처리 함수
const processImageFile = (file: File): Promise<ImageItem> => {
  return new Promise((resolve, reject) => {
    // 이미 처리 중인 파일은 건너뜁니다
    // if (isProcessingRef.current) {
    //   reject(new Error("Already processing files"))
    //   return
    // }

    const reader = new FileReader()

    reader.onload = () => {
      const dataUrl = reader.result as string
      if (!dataUrl) {
        reject(new Error(`Failed to read file: ${file.name}`))
        return
      }

      // 이미지 크기 가져오기
      const img = new Image()
      img.onload = () => {
        resolve({
          id: uuidv4(),
          src: dataUrl,
          file: file,
          width: img.width,
          height: img.height,
          isUserUploaded: true, // 사용자가 업로드한 이미지임을 표시
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

export default memo(LayoutCard)
