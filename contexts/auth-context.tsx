"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  provider: "google" | "apple" | "facebook"
  maxAccounts: number // 최대 연결 가능 계정 수
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (provider: "google" | "apple" | "facebook") => Promise<void>
  logout: () => Promise<void>
  updateUser: (updatedUser: User) => void // 사용자 정보 업데이트 함수
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // 개발 환경에서 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true)

      try {
        // 로컬 스토리지에서 사용자 정보 가져오기
        const storedUser = localStorage.getItem("pre-gram-user")

        if (storedUser) {
          // 저장된 사용자 정보가 있으면 사용
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } else {
          // 저장된 사용자 정보가 없으면 null 상태 유지
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // 로그인 가드
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login" && !pathname.startsWith("/instagram")) {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router])

  // 로그인 함수
  const login = async (provider: "google" | "apple" | "facebook") => {
    try {
      setIsLoading(true)

      // 개발 환경에서는 항상 모의 사용자 생성
      const mockUser = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        name: `Test User (${provider})`,
        email: `user-${Math.random().toString(36).substr(2, 9)}@example.com`,
        provider,
        maxAccounts: 1,
      }

      setUser(mockUser)
      localStorage.setItem("pre-gram-user", JSON.stringify(mockUser))
      router.push("/instagram/connect")
    } catch (error) {
      console.error(`${provider} login error:`, error)
      toast({
        title: "Login failed",
        description: "There was a problem signing in. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 로그아웃 함수
  const logout = async () => {
    try {
      setUser(null)
      localStorage.removeItem("pre-gram-user")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  // 사용자 정보 업데이트 함수
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("pre-gram-user", JSON.stringify(updatedUser))
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
