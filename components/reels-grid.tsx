"use client"

import type React from "react"

import { useState, useCallback, memo, useRef, useEffect } from "react"
import { DndContext, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImageItem } from "@/types/image"
import { motion, AnimatePresence } from "framer-motion"
import OptimizedImage from "@/components/optimized-image"
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect"

interface ReelsGridProps {
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
      className="relative w-full h-full overflow-hidden bg-muted rounded-md aspect-[9/16]"
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

    // 컴포넌트 언마운트 시 타임아웃 정리
    useEffect(() => {
      return () => {
        if (removeTimeoutRef.current) {
          clearTimeout(removeTimeoutRef.current)
        }
      }
    }, [])

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 1,
      position: "relative" as const,
      touchAction: "none",
    }

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsRemoving(true)

        // 시각적 피드백을 위한 짧은 지연
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
              alt="Instagram reel"
              fill
              className="object-cover"
              onError={handleImageError}
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          )}
        </ImageContainer>

        {/* 삭제 버튼 */}
        {!readOnly && <RemoveButton onClick={handleRemove} disabled={isRemoving} />}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // 프롭이 변경되지 않았으면 리렌더링 방지
    return (
      prevProps.image.id === nextProps.image.id &&
      prevProps.isDragging === nextProps.isDragging &&
      prevProps.readOnly === nextProps.readOnly
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
      <div className="relative w-full h-full overflow-hidden bg-muted rounded-md aspect-[9/16]">
        {imageError ? (
          <ImageErrorFallback />
        ) : (
          <OptimizedImage
            src={image.src || "/placeholder.svg"}
            alt="Instagram reel"
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

// ReelsGrid 컴포넌트
function ReelsGrid({ images, onReorder, onRemoveImage, readOnly = false }: ReelsGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const prevImagesRef = useRef<ImageItem[]>([])
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    // 깊은 비교를 위해 JSON 문자열로 변환하여 비교
    const currentImagesJson = JSON.stringify(images.map((img) => img.id || ""))
    const prevImagesJson = JSON.stringify(prevImagesRef.current.map((img) => img.id || ""))

    if (currentImagesJson !== prevImagesJson) {
      prevImagesRef.current = [...images]
    }
  }, [images])

  // 사용자 업로드 이미지와 기존 이미지 분리
  const userUploadedImages = images.filter((img) => img.isUserUploaded === true)
  const existingImages = images.filter((img) => img.isUserUploaded !== true)

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

      // 드래그 종료 시 activeId 초기화
      setActiveId(null)

      if (!over) return

      // 같은 위치로 드래그한 경우 무시
      if (active.id === over.id) return

      // 사용자 업로드 이미지 배열에서만 인덱스 찾기
      const oldIndex = userUploadedImages.findIndex((img) => img.id === active.id)
      const newIndex = userUploadedImages.findIndex((img) => img.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        // 재정렬 중임을 표시
        setIsReordering(true)

        // 사용자 업로드 이미지 배열만 재정렬
        const reorderedUserImages = arrayMove(userUploadedImages, oldIndex, newIndex)

        // 전체 이미지 배열 재구성 (사용자 업로드 이미지 + 기존 이미지)
        const reorderedImages = [...reorderedUserImages, ...existingImages]

        // 이전 이미지 배열과 비교하여 변경된 경우에만 업데이트
        const currentImagesJson = JSON.stringify(images.map((img) => img.id || ""))
        const reorderedImagesJson = JSON.stringify(reorderedImages.map((img) => img.id || ""))

        if (currentImagesJson !== reorderedImagesJson) {
          // 약간의 지연 후 부모 컴포넌트에 알림 - 애니메이션 완료 후
          if (reorderTimeoutRef.current) {
            clearTimeout(reorderTimeoutRef.current)
          }

          // 상태 업데이트를 한 번만 수행하고 부모에게 알림
          reorderTimeoutRef.current = setTimeout(() => {
            // 부모 컴포넌트에 알림 전에 로컬 상태 업데이트 방지
            onReorder(reorderedImages)

            // 약간의 지연 후 재정렬 상태 해제
            setTimeout(() => {
              setIsReordering(false)
            }, 50)
          }, 100)
        } else {
          setIsReordering(false)
        }
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
          <SortableContext items={userUploadedImages.map((img) => img.id || "")} strategy={rectSortingStrategy}>
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

export default memo(ReelsGrid)
