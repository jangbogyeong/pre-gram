"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function InstagramCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const code = searchParams.get("code")

    if (!code) {
      toast({
        title: "인증 실패",
        description: "인스타그램 인증 코드를 받지 못했습니다.",
        variant: "destructive",
      })
      router.push("/instagram/connect")
      return
    }

    // 실제 구현에서는 여기서 API 호출로 코드를 서버에 전송하고 토큰 교환
    // 여기서는 예시로 setTimeout 사용
    setTimeout(() => {
      // 연동 성공 시뮬레이션
      localStorage.setItem("instagram-connected", "true")
      localStorage.setItem("instagram-username", "example_user")

      toast({
        title: "인스타그램 계정 연동 성공",
        description: "example_user 계정이 성공적으로 연동되었습니다.",
      })

      setIsProcessing(false)
      router.push("/fetch-feed")
    }, 2000)
  }, [searchParams, router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">인스타그램 계정 연동 중...</h1>
        <p className="text-muted-foreground">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
}
