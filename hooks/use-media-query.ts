"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  // 기본값을 false로 설정
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // 브라우저 환경인지 확인
    if (typeof window === "undefined") {
      return
    }

    // 미디어 쿼리 생성
    let media: MediaQueryList

    try {
      media = window.matchMedia(query)

      // 초기 상태 설정
      setMatches(media.matches)

      // 변경 이벤트 리스너 함수
      const listener = (e: MediaQueryListEvent) => {
        setMatches(e.matches)
      }

      // 리스너 등록 (브라우저 호환성 고려)
      if (media.addEventListener) {
        media.addEventListener("change", listener)
      } else {
        // @ts-ignore - 이전 브라우저 지원
        media.addListener(listener)
      }

      // 클린업
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener("change", listener)
        } else {
          // @ts-ignore - 이전 브라우저 지원
          media.removeListener(listener)
        }
      }
    } catch (error) {
      console.error("Error setting up media query:", error)
      return
    }
  }, [query])

  return matches
}
