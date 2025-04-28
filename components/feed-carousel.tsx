"use client"

import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import LayoutCard from "@/components/layout-card"
import type { ImageItem } from "@/contexts/project-context"

interface FeedCarouselProps {
  type: "feed" | "reels"
  layouts: Array<{
    id: string
    images: ImageItem[]
  }>
  onReorder: (layoutId: string, reorderedImages: ImageItem[]) => void
  onRemoveImage: (layoutId: string, imageId: string) => void
  onDuplicateLayout: (layoutId: string) => void
  onDeleteLayout: (layoutId: string) => void
  onAddImages: (layoutId: string, images: ImageItem[]) => void
}

// 화살표 버튼 컴포넌트
const CarouselArrow = memo(function CarouselArrow({
  direction,
  onClick,
  show,
}: {
  direction: "left" | "right"
  onClick: () => void
  show: boolean
}) {
  if (!show) return null

  return (
    <Button
      variant="outline"
      size="icon"
      className={`absolute ${
        direction === "left" ? "left-0" : "right-0"
      } top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm`}
      onClick={onClick}
    >
      {direction === "left" ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </Button>
  )
})

// 메모이제이션된 레이아웃 카드 래퍼
const MemoizedLayoutCard = memo(function MemoizedLayoutCard({
  id,
  index,
  type,
  images,
  onReorder,
  onRemoveImage,
  onDuplicate,
  onDelete,
  onAddImages,
}: {
  id: string
  index: number
  type: "feed" | "reels"
  images: ImageItem[]
  onReorder: (layoutId: string, reorderedImages: ImageItem[]) => void
  onRemoveImage: (layoutId: string, imageId: string) => void
  onDuplicate: (layoutId: string) => void
  onDelete: (layoutId: string) => void
  onAddImages: (layoutId: string, images: ImageItem[]) => void
}) {
  return (
    <LayoutCard
      id={id}
      index={index}
      type={type}
      images={images}
      onReorder={onReorder}
      onRemoveImage={onRemoveImage}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onAddImages={onAddImages}
    />
  )
})

// Optimize the main carousel component
const FeedCarousel = memo(
  function FeedCarousel({
    type,
    layouts,
    onReorder,
    onRemoveImage,
    onDuplicateLayout,
    onDeleteLayout,
    onAddImages,
  }: FeedCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)
    const scrollUpdateTimeoutRef = useRef<number | null>(null)
    const prevLayoutsRef = useRef<typeof layouts>([])
    const isScrollingRef = useRef(false)
    const layoutsLengthRef = useRef(layouts.length)
    const scrollStateRef = useRef({ showLeft: false, showRight: true })

    // Only update the ref when layouts length changes
    useEffect(() => {
      layoutsLengthRef.current = layouts.length
    }, [layouts.length])

    // Optimize scroll state update with requestAnimationFrame
    const updateScrollState = useCallback(() => {
      if (!scrollContainerRef.current || isScrollingRef.current) return

      if (scrollUpdateTimeoutRef.current) {
        cancelAnimationFrame(scrollUpdateTimeoutRef.current)
      }

      scrollUpdateTimeoutRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) return

        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        const newShowLeftArrow = scrollLeft > 0
        const newShowRightArrow = scrollLeft < scrollWidth - clientWidth - 10

        // Only update state if values actually changed
        if (newShowLeftArrow !== scrollStateRef.current.showLeft) {
          scrollStateRef.current.showLeft = newShowLeftArrow
          setShowLeftArrow(newShowLeftArrow)
        }

        if (newShowRightArrow !== scrollStateRef.current.showRight) {
          scrollStateRef.current.showRight = newShowRightArrow
          setShowRightArrow(newShowRightArrow)
        }

        scrollUpdateTimeoutRef.current = null
      })
    }, [])

    // Check for actual layout changes before updating
    useEffect(() => {
      const layoutsChanged =
        JSON.stringify(layouts.map((l) => l.id)) !== JSON.stringify(prevLayoutsRef.current.map((l) => l.id))

      if (layoutsChanged) {
        prevLayoutsRef.current = layouts
        updateScrollState()
      }

      const handleResize = () => {
        if (scrollUpdateTimeoutRef.current) {
          cancelAnimationFrame(scrollUpdateTimeoutRef.current)
        }

        scrollUpdateTimeoutRef.current = requestAnimationFrame(() => {
          updateScrollState()
          scrollUpdateTimeoutRef.current = null
        })
      }

      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
        if (scrollUpdateTimeoutRef.current) {
          cancelAnimationFrame(scrollUpdateTimeoutRef.current)
        }
      }
    }, [layouts, updateScrollState])

    const handleScroll = useCallback(() => {
      if (scrollUpdateTimeoutRef.current) {
        cancelAnimationFrame(scrollUpdateTimeoutRef.current)
      }

      scrollUpdateTimeoutRef.current = requestAnimationFrame(() => {
        updateScrollState()
        scrollUpdateTimeoutRef.current = null
      })
    }, [updateScrollState])

    const scrollLeft = useCallback(() => {
      if (!scrollContainerRef.current) return

      isScrollingRef.current = true
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })

      setTimeout(() => {
        isScrollingRef.current = false
        updateScrollState()
      }, 300)
    }, [updateScrollState])

    const scrollRight = useCallback(() => {
      if (!scrollContainerRef.current) return

      isScrollingRef.current = true
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })

      setTimeout(() => {
        isScrollingRef.current = false
        updateScrollState()
      }, 300)
    }, [updateScrollState])

    // Memoize the layout cards to prevent unnecessary re-renders
    const layoutCards = useMemo(() => {
      return layouts.map((layout, index) => (
        <MemoizedLayoutCard
          key={layout.id}
          id={layout.id}
          index={index}
          type={type}
          images={layout.images}
          onReorder={onReorder}
          onRemoveImage={onRemoveImage}
          onDuplicate={onDuplicateLayout}
          onDelete={onDeleteLayout}
          onAddImages={onAddImages}
        />
      ))
    }, [layouts, type, onReorder, onRemoveImage, onDuplicateLayout, onDeleteLayout, onAddImages])

    return (
      <div className="relative w-full">
        <CarouselArrow direction="left" onClick={scrollLeft} show={showLeftArrow} />
        <CarouselArrow direction="right" onClick={scrollRight} show={showRightArrow} />

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x snap-mandatory"
          onScroll={handleScroll}
        >
          {layoutCards}
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Deep comparison of layouts to prevent unnecessary re-renders
    const prevIds = prevProps.layouts.map((l) => l.id).join(",")
    const nextIds = nextProps.layouts.map((l) => l.id).join(",")

    if (prevIds !== nextIds) return false

    // Check if any layout's images have changed
    for (let i = 0; i < prevProps.layouts.length; i++) {
      const prevImgIds = prevProps.layouts[i].images.map((img) => img.id).join(",")
      const nextImgIds = nextProps.layouts[i].images.map((img) => img.id).join(",")
      if (prevImgIds !== nextImgIds) return false
    }

    return prevProps.type === nextProps.type
  },
)

export default FeedCarousel
