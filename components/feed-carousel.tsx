"use client"

import { useState, useRef, useEffect, memo } from "react"
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

// memo로 컴포넌트 최적화
const FeedCarousel = memo(function FeedCarousel({
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

  // 스크롤 상태 업데이트
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current

    // 레이아웃이 1개 이하면 화살표를 표시하지 않음
    if (layouts.length <= 1) {
      setShowLeftArrow(false)
      setShowRightArrow(false)
      return
    }

    // 스크롤 위치가 0이면 왼쪽 화살표 숨김
    setShowLeftArrow(scrollLeft > 10)

    // 스크롤이 끝에 도달하면 오른쪽 화살표 숨김 (10px 버퍼)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // 초기 및 레이아웃 변경 시 스크롤 상태 업데이트
  useEffect(() => {
    // 레이아웃이 변경되면 스크롤 상태 업데이트
    updateScrollState()

    // 윈도우 리사이즈 시 스크롤 상태 업데이트
    window.addEventListener("resize", updateScrollState)
    return () => window.removeEventListener("resize", updateScrollState)
  }, [layouts])

  const handleScroll = () => {
    updateScrollState()
  }

  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
  }

  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
  }

  return (
    <div className="relative w-full">
      {/* 스크롤 화살표 */}
      {showLeftArrow && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {showRightArrow && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* 피드 캐러셀 */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x snap-mandatory"
        onScroll={handleScroll}
      >
        {/* 레이아웃 카드들 */}
        {layouts.map((layout, index) => (
          <LayoutCard
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
        ))}
      </div>
    </div>
  )
})

export default FeedCarousel
