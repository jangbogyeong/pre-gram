"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useRef, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 페이지 변경 감지 및 로딩 상태 관리
  useEffect(() => {
    // 페이지가 변경되면 로딩 상태 표시
    const handleRouteChangeStart = () => {
      setIsLoading(true)

      // 이전 타임아웃 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    // 페이지 로드 완료 시 로딩 상태 해제
    const handleRouteChangeComplete = () => {
      // 약간의 지연 후 로딩 상태 해제 (부드러운 전환을 위해)
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false)
      }, 100)
    }

    // 라우터 이벤트 리스너 등록
    window.addEventListener("beforeunload", handleRouteChangeStart)
    window.addEventListener("load", handleRouteChangeComplete)

    return () => {
      window.removeEventListener("beforeunload", handleRouteChangeStart)
      window.removeEventListener("load", handleRouteChangeComplete)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [router])

  // 자식 컴포넌트 업데이트 처리
  useEffect(() => {
    if (children !== displayChildren) {
      setIsLoading(true)

      // 약간의 지연 후 자식 컴포넌트 업데이트 (페이드 아웃 효과를 위해)
      timeoutRef.current = setTimeout(() => {
        setDisplayChildren(children)
        setIsLoading(false)
      }, 200)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [children, displayChildren])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {isLoading ? (
          <div className="page-loading">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          displayChildren
        )}
      </motion.div>
    </AnimatePresence>
  )
}
