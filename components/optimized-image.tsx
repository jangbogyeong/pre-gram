"use client"

import { useState, useEffect, useRef, memo } from "react"
import Image from "next/image"

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  fallbackSrc?: string
  onLoadingComplete?: () => void
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  priority = false,
  quality,
  fallbackSrc = "/placeholder.svg?height=400&width=400",
  onLoadingComplete,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const callbackCalled = useRef(false)

  // 이미지 소스 결정
  const imageSrc = hasError ? fallbackSrc : src

  // 이미지 로딩 상태 관리
  useEffect(() => {
    // 이미지 URL이 변경되면 상태 초기화
    setIsLoaded(false)
    setHasError(false)
    callbackCalled.current = false

    // 이미지가 이미 로드되었는지 확인
    if (imageRef.current?.complete) {
      setIsLoaded(true)
      if (onLoadingComplete && !callbackCalled.current) {
        onLoadingComplete()
        callbackCalled.current = true
      }
    }
  }, [src, onLoadingComplete])

  // 클래스 이름 구성
  const imageClassName = `${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`

  return (
    <Image
      ref={imageRef}
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={imageClassName}
      onLoad={() => {
        setIsLoaded(true)
        if (onLoadingComplete && !callbackCalled.current) {
          onLoadingComplete()
          callbackCalled.current = true
        }
      }}
      onError={() => {
        setHasError(true)
      }}
    />
  )
})

export default OptimizedImage
