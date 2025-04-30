"use client"

import { useState, useCallback, memo } from "react"
import Image from "next/image"
import { DndContext, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImageItem } from "@/contexts/project-context"
import { motion } from "framer-motion"

interface FeedGridProps {
  images: ImageItem[]
  onReorder: (images: ImageItem[]) => void
  onRemoveImage: (id: string) => void
  readOnly?: boolean
}

// SortableImage 컴포넌트 - 사용자 업로드 이미지용
const SortableImage = memo(function SortableImage({
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id })
  const [isRemoving, setIsRemoving] = useState(false)
  const [imageError, setImageError] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as const,
    touchAction: "none",
  }

  const handleRemove = () => {
    setIsRemoving(true)
    // 시각적 피드백을 위한 짧은 지연
    setTimeout(() => {
      console.log("FeedGrid: Removing image with ID:", image.id)
      onRemove(image.id)
    }, 200)
  }

  const handleImageError = () => {
    console.error(`Error loading image: ${image.id}`)
    setImageError(true)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(readOnly ? {} : { ...attributes, ...listeners })}
      className="relative group"
    >
      <motion.div
        animate={{
          scale: isRemoving ? 0.8 : 1,
          opacity: isRemoving ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="relative w-full h-full overflow-hidden bg-muted rounded-none aspect-[4/5] border border-background"
      >
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        ) : (
          <Image
            src={image.src || "/placeholder.svg"}
            alt="Instagram post"
            fill
            className="object-cover"
            onError={handleImageError}
          />
        )}
      </motion.div>

      {/* 삭제 버튼 */}
      {!readOnly && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
          disabled={isRemoving}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
})

// 정적 이미지 컴포넌트 - 기존 피드 이미지용
const StaticImage = memo(function StaticImage({ image }: { image: ImageItem }) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    console.error(`Error loading static image: ${image.id}`)
    setImageError(true)
  }

  return (
    <div className="relative">
      <div className="relative w-full h-full overflow-hidden bg-muted rounded-none aspect-[4/5] border border-background">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        ) : (
          <Image
            src={image.src || "/placeholder.svg"}
            alt="Instagram post"
            fill
            className="object-cover"
            onError={handleImageError}
          />
        )}
      </div>
    </div>
  )
})

// FeedGrid 컴포넌트
function FeedGrid({ images, onReorder, onRemoveImage, readOnly = false }: FeedGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // 사용자 업로드 이미지와 기존 이미지 분리
  const userUploadedImages = images.filter((img) => img.isUserUploaded === true)
  const existingImages = images.filter((img) => img.isUserUploaded !== true)

  console.log(`FeedGrid: User uploaded images: ${userUploadedImages.length}, Existing images: ${existingImages.length}`)

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

      console.log(`FeedGrid: Started dragging image ${event.active.id}`)
      setActiveId(event.active.id as string)
    },
    [readOnly],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (readOnly) return

      const { active, over } = event

      // 드래그 종료 시 activeId 초기화
      setActiveId(null)

      if (!over) {
        console.log("FeedGrid: Drag ended without a target")
        return
      }

      // 같은 위치로 드래그한 경우 무시
      if (active.id === over.id) {
        console.log("FeedGrid: Dragged to same position, ignoring")
        return
      }

      console.log(`FeedGrid: Dragged image ${active.id} over ${over.id}`)

      // 사용자 업로드 이미지 배열에서만 인덱스 찾기
      const oldIndex = userUploadedImages.findIndex((img) => img.id === active.id)
      const newIndex = userUploadedImages.findIndex((img) => img.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        console.log(`FeedGrid: Reordering from index ${oldIndex} to ${newIndex}`)

        // 사용자 업로드 이미지 배열만 재정렬
        const reorderedUserImages = arrayMove(userUploadedImages, oldIndex, newIndex)

        // 전체 이미지 배열 재구성 (사용자 업로드 이미지 + 기존 이미지)
        const reorderedImages = [...reorderedUserImages, ...existingImages]

        console.log(`FeedGrid: Reordered images, new order has ${reorderedImages.length} images`)
        console.log(`FeedGrid: User uploaded images after reorder: ${reorderedUserImages.length}`)

        // 부모 컴포넌트에 알림 - 상태 업데이트를 위해 반드시 호출
        onReorder(reorderedImages)
      } else {
        console.warn(`FeedGrid: Could not find indices for drag operation. Old: ${oldIndex}, New: ${newIndex}`)
      }
    },
    [userUploadedImages, existingImages, onReorder, readOnly],
  )

  // 이미지 제거 핸들러
  const handleRemoveImage = useCallback(
    (imageId: string) => {
      console.log("FeedGrid: Removing image", imageId)

      // 부모 컴포넌트에 알림
      onRemoveImage(imageId)
    },
    [onRemoveImage],
  )

  return (
    <div className="bg-background">
      <div className="grid grid-cols-3 gap-0 border-separate border-spacing-0">
        {/* 사용자 업로드 이미지 - 드래그 가능 */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={userUploadedImages.map((img) => img.id)} strategy={rectSortingStrategy}>
            {userUploadedImages.map((image) => (
              <SortableImage
                key={image.id}
                image={image}
                onRemove={handleRemoveImage}
                isDragging={activeId === image.id}
                readOnly={readOnly}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* 기존 피드 이미지 - 드래그 불가 */}
        {existingImages.map((image) => (
          <StaticImage key={image.id} image={image} />
        ))}

        {/* 이미지가 없을 때 표시할 메시지 */}
        {images.length === 0 && (
          <div className="col-span-3 h-60 flex items-center justify-center text-muted-foreground">
            Upload images to start
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(FeedGrid)
