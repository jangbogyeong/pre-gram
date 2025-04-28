"use client"

import type React from "react"

import { useState, useCallback, memo, useRef, useEffect, useMemo } from "react"
import { DndContext, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImageItem } from "@/types/image"
import { motion, AnimatePresence } from "framer-motion"
import OptimizedImage from "@/components/optimized-image"
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect"

interface FeedGridProps {
  images: ImageItem[]
  onReorder: (images: ImageItem[]) => void
  onRemoveImage: (id: string) => void
  readOnly?: boolean
}

// 이미지 컨테이너 컴포넌트
const ImageContainer = memo(function ImageContainer({
  children,
  isRemoving,
}: {
  children: React.ReactNode
  isRemoving: boolean
}) {
  return (
    <motion.div
      animate={{
        scale: isRemoving ? 0.8 : 1,
        opacity: isRemoving ? 0 : 1,
      }}
      transition={{ duration: 0.2 }}
      className="relative w-full h-full overflow-hidden bg-muted rounded-md aspect-[4/5]"
    >
      {children}
    </motion.div>
  )
})

// 이미지 에러 표시 컴포넌트
const ImageErrorFallback = memo(function ImageErrorFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
    </div>
  )
})

// 삭제 버튼 컴포넌트
const RemoveButton = memo(function RemoveButton({
  onClick,
  disabled,
}: {
  onClick: (e: React.MouseEvent) => void
  disabled: boolean
}) {
  return (
    <Button
      variant="destructive"
      size="icon"
      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={onClick}
      disabled={disabled}
    >
      <X className="h-3 w-3" />
    </Button>
  )
})

// SortableImage 컴포넌트 - 사용자 업로드 이미지용
const SortableImage = memo(
  function SortableImage({
    image,
    onRemove,
    isDragging,
    readOnly,
  }: {
    image: ImageItem
    onRemove: (id: string) => void
    isDragging: boolean
    readOnly?: boolean
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id || "" })
    const [isRemoving, setIsRemoving] = useState(false)
    const [imageError, setImageError] = useState(false)
    const removeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Clean up timeout on unmount
    useEffect(() => {
      return () => {
        if (removeTimeoutRef.current) {
          clearTimeout(removeTimeoutRef.current)
        }
      }
    }, [])

    const style = useMemo(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: "relative" as const,
        touchAction: "none",
      }),
      [transform, transition, isDragging],
    )

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsRemoving(true)

        removeTimeoutRef.current = setTimeout(() => {
          onRemove(image.id || "")
        }, 200)
      },
      [image.id, onRemove],
    )

    const handleImageError = useCallback(() => {
      setImageError(true)
    }, [])

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...(readOnly ? {} : { ...attributes, ...listeners })}
        className="relative group"
      >
        <ImageContainer isRemoving={isRemoving}>
          {imageError ? (
            <ImageErrorFallback />
          ) : (
            <OptimizedImage
              src={image.src || "/placeholder.svg"}
              alt="Instagram post"
              fill
              className="object-cover"
              onError={handleImageError}
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          )}
        </ImageContainer>

        {!readOnly && <RemoveButton onClick={handleRemove} disabled={isRemoving} />}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // More comprehensive equality check
    return (
      prevProps.image.id === nextProps.image.id &&
      prevProps.isDragging === nextProps.isDragging &&
      prevProps.readOnly === nextProps.readOnly &&
      prevProps.image.src === nextProps.image.src
    )
  },
)

// 정적 이미지 컴포넌트 - 기존 피드 이미지용
const StaticImage = memo(function StaticImage({ image }: { image: ImageItem }) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  return (
    <div className="relative">
      <div className="relative w-full h-full overflow-hidden bg-muted rounded-md aspect-[4/5]">
        {imageError ? (
          <ImageErrorFallback />
        ) : (
          <OptimizedImage
            src={image.src || "/placeholder.svg"}
            alt="Instagram post"
            fill
            className="object-cover"
            onError={handleImageError}
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        )}
      </div>
    </div>
  )
})

// 빈 그리드 메시지 컴포넌트
const EmptyGridMessage = memo(function EmptyGridMessage() {
  return (
    <div className="col-span-3 h-60 flex items-center justify-center text-muted-foreground">Upload images to start</div>
  )
})

// FeedGrid 컴포넌트
function FeedGrid({ images, onReorder, onRemoveImage, readOnly = false }: FeedGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const prevImagesRef = useRef<ImageItem[]>([])
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dragOperationInProgressRef = useRef(false)

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (reorderTimeoutRef.current) {
        clearTimeout(reorderTimeoutRef.current)
      }
    }
  }, [])

  // 이미지 배열이 변경되었는지 확인
  useIsomorphicLayoutEffect(() => {
    // 드래그 작업 중에는 이미지 업데이트 건너뛰기
    if (dragOperationInProgressRef.current) return

    // 깊은 비교를 위해 JSON 문자열로 변환하여 비교
    const currentImagesJson = JSON.stringify(images.map((img) => img.id || ""))
    const prevImagesJson = JSON.stringify(prevImagesRef.current.map((img) => img.id || ""))

    if (currentImagesJson !== prevImagesJson) {
      prevImagesRef.current = [...images]
    }
  }, [images])

  // 사용자 업로드 이미지와 기존 이미지 분리
  const userUploadedImages = useMemo(() => {
    return images.filter((img) => img.isUserUploaded === true)
  }, [images])

  const existingImages = useMemo(() => {
    return images.filter((img) => img.isUserUploaded !== true)
  }, [images])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (readOnly) return

      dragOperationInProgressRef.current = true
      const { active } = event
      if (active && active.id) {
        setActiveId(String(active.id))
      }
    },
    [readOnly],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (readOnly) return

      const { active, over } = event

      // Reset active ID immediately to prevent UI jank
      setActiveId(null)

      if (!over) {
        dragOperationInProgressRef.current = false
        return
      }

      if (active.id === over.id) {
        dragOperationInProgressRef.current = false
        return
      }

      // Find indices only once
      const oldIndex = userUploadedImages.findIndex((img) => img.id === active.id)
      const newIndex = userUploadedImages.findIndex((img) => img.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        // Create a new array with the reordered items
        const reorderedUserImages = arrayMove(userUploadedImages, oldIndex, newIndex)
        const reorderedImages = [...reorderedUserImages, ...existingImages]

        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          // Only update if the order actually changed
          const currentImagesJson = JSON.stringify(images.map((img) => img.id || ""))
          const reorderedImagesJson = JSON.stringify(reorderedImages.map((img) => img.id || ""))

          if (currentImagesJson !== reorderedImagesJson) {
            // Notify parent component of the reordering
            onReorder(reorderedImages)
          }

          // Reset drag operation flag after a short delay
          setTimeout(() => {
            dragOperationInProgressRef.current = false
          }, 100)
        })
      } else {
        dragOperationInProgressRef.current = false
      }
    },
    [userUploadedImages, existingImages, onReorder, readOnly, images],
  )

  // 이미지 제거 핸들러
  const handleRemoveImage = useCallback(
    (imageId: string) => {
      onRemoveImage(imageId)
    },
    [onRemoveImage],
  )

  // 이미지 ID 목록 메모이제이션
  const sortableItems = useMemo(() => {
    return userUploadedImages.map((img) => img.id || "")
  }, [userUploadedImages])

  return (
    <div className="bg-background rounded-lg">
      <div className="grid grid-cols-3 gap-1">
        {/* 사용자 업로드 이미지 - 드래그 가능 */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          autoScroll={{ threshold: { x: 0.2, y: 0.2 } }}
        >
          <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
            <AnimatePresence>
              {userUploadedImages.map((image) => (
                <motion.div
                  key={image.id || `user-${Math.random()}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  layout={!isReordering}
                >
                  <SortableImage
                    image={image}
                    onRemove={handleRemoveImage}
                    isDragging={activeId === image.id}
                    readOnly={readOnly}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>

        {/* 기존 피드 이미지 - 드래그 불가 */}
        <AnimatePresence>
          {existingImages.map((image) => (
            <motion.div
              key={image.id || `existing-${Math.random()}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <StaticImage key={image.id} image={image} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 이미지가 전혀 없을 때만 표시할 메시지 */}
        {userUploadedImages.length === 0 && existingImages.length === 0 && <EmptyGridMessage />}
      </div>
    </div>
  )
}

export default memo(FeedGrid)
