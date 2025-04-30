"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

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
  login: (provider: "google" | "apple" | "facebook") => void
  logout: () => void
  updateUser: (updatedUser: User) => void // 사용자 정보 업데이트 함수
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem("pre-gram-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // 로그인 가드 처리 수정
  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== "/login" && pathname !== "/connect-instagram") {
        router.push("/login")
      }
    }
  }, [user, isLoading, pathname, router])

  // 로그인 함수 수정
  const login = (provider: "google" | "apple" | "facebook") => {
    console.log(`${provider} login clicked`)

    // 실제 로그인 대신 가상의 사용자 정보 생성
    const mockUser = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name: `Test User (${provider})`,
      email: `user-${Math.random().toString(36).substr(2, 9)}@example.com`,
      provider,
      maxAccounts: 1, // 기본값: 1개 계정 연결 가능
    }

    setUser(mockUser)
    localStorage.setItem("pre-gram-user", JSON.stringify(mockUser))
    router.push("/connect-instagram")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pre-gram-user")
    router.push("/login")
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
