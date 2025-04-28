"use client"

import { useEffect, useState, type ReactNode } from "react"

export default function ClientProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // 클라이언트 측 마운트 후에만 렌더링
  useEffect(() => {
    setMounted(true)
  }, [])

  // 서버 사이드 렌더링 중에는 자식 컴포넌트를 숨김
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>
  }

  return <>{children}</>
}
