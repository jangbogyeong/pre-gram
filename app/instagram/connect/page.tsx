"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Instagram, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function InstagramConnectPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [instagramUsername, setInstagramUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // 로그인 상태 확인
    if (status === "unauthenticated") {
      router.push("/login")
    }

    // 인스타그램 연동 상태 확인 (실제로는 API 호출)
    // 여기서는 예시로 localStorage 사용
    const connected = localStorage.getItem("instagram-connected") === "true"
    const username = localStorage.getItem("instagram-username") || ""

    setIsConnected(connected)
    setInstagramUsername(username)
  }, [status, router])

  const handleConnectInstagram = () => {
    setIsLoading(true)

    // 실제 구현에서는 Instagram OAuth 프로세스 시작
    // 여기서는 예시로 setTimeout 사용
    setTimeout(() => {
      // 연동 성공 시뮬레이션
      localStorage.setItem("instagram-connected", "true")
      localStorage.setItem("instagram-username", "example_user")

      setIsConnected(true)
      setInstagramUsername("example_user")
      setIsLoading(false)

      toast({
        title: "인스타그램 계정 연동 성공",
        description: "example_user 계정이 성공적으로 연동되었습니다.",
      })
    }, 2000)
  }

  const handleDisconnectInstagram = () => {
    setIsLoading(true)

    // 실제 구현에서는 API 호출로 연동 해제
    // 여기서는 예시로 setTimeout 사용
    setTimeout(() => {
      localStorage.removeItem("instagram-connected")
      localStorage.removeItem("instagram-username")

      setIsConnected(false)
      setInstagramUsername("")
      setIsLoading(false)

      toast({
        title: "인스타그램 계정 연동 해제",
        description: "계정 연동이 해제되었습니다.",
      })
    }, 1000)
  }

  const handleAddAnotherAccount = () => {
    toast({
      title: "프리미엄 기능",
      description: "여러 계정 연동은 프리미엄 구독이 필요합니다.",
      variant: "destructive",
    })
  }

  // 로딩 중이거나 인증되지 않은 상태면 로딩 표시
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">인스타그램 계정 연동</h1>
        <div className="w-10"></div> {/* 헤더 균형을 위한 빈 공간 */}
      </header>

      <main className="flex-1 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-6 w-6" />
                인스타그램 계정
              </CardTitle>
              <CardDescription>
                인스타그램 계정을 연동하여 실제 피드를 불러오고 미리보기를 구성해보세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected ? (
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Instagram className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">@{instagramUsername}</p>
                      <p className="text-sm text-muted-foreground">연동됨</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleDisconnectInstagram} disabled={isLoading}>
                    연동 해제
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Instagram className="h-8 w-8" />
                  </div>
                  <p className="text-center text-muted-foreground">아직 연동된 인스타그램 계정이 없습니다.</p>
                  <Button className="w-full" onClick={handleConnectInstagram} disabled={isLoading}>
                    {isLoading ? "연동 중..." : "인스타그램 계정 연동하기"}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleAddAnotherAccount}>
                <Lock className="h-4 w-4" />
                다른 계정 추가 (프리미엄)
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                계정 연동 시 프로필 정보와 미디어에만 접근합니다. 포스팅 권한은 요청하지 않습니다.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
