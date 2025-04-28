"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

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
  const { data: session, status } = useSession()

  // NextAuth 세션에서 사용자 정보 불러오기
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // NextAuth 세션에서 사용자 정보 가져오기
      const nextAuthUser = session.user

      // 로컬 스토리지에서 추가 정보 가져오기
      let storedUserData = null
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("pre-gram-user")
        if (storedUser) {
          try {
            storedUserData = JSON.parse(storedUser)
          } catch (e) {
            console.error("Failed to parse stored user data:", e)
          }
        }
      }

      // 사용자 정보 병합
      const mergedUser: User = {
        id: nextAuthUser.id || nextAuthUser.email || "",
        name: nextAuthUser.name || "User",
        email: nextAuthUser.email || "",
        provider: (storedUserData?.provider || "google") as "google" | "apple" | "facebook",
        maxAccounts: storedUserData?.maxAccounts || 1,
      }

      setUser(mergedUser)

      // 로컬 스토리지에 업데이트된 사용자 정보 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("pre-gram-user", JSON.stringify(mergedUser))
      }
    } else if (status === "unauthenticated") {
      setUser(null)
    }

    setIsLoading(status === "loading")
  }, [session, status])

  // 로그인 가드 처리 수정
  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ["/login", "/connect-instagram"]
      if (!user && !publicPaths.includes(pathname)) {
        router.push("/login")
      }
    }
  }, [user, isLoading, pathname, router])

  // 로그인 함수 수정 - NextAuth 사용
  const login = (provider: "google" | "apple" | "facebook") => {
    console.log(`${provider} login clicked - using NextAuth`)
    // 실제 로그인은 login 페이지에서 처리
  }

  const logout = () => {
    signOut({ redirect: false }).then(() => {
      setUser(null)
      if (typeof window !== "undefined") {
        localStorage.removeItem("pre-gram-user")
      }
      router.push("/login")
    })
  }

  // 사용자 정보 업데이트 함수
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("pre-gram-user", JSON.stringify(updatedUser))
    }
  }

  // 개발 모드에서는 로그인 없이도 사용할 수 있도록 더미 사용자 생성
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && status === "unauthenticated" && !user) {
      const dummyUser: User = {
        id: "dev-user",
        name: "Development User",
        email: "dev@example.com",
        provider: "google",
        maxAccounts: 2,
      }
      setUser(dummyUser)
      if (typeof window !== "undefined") {
        localStorage.setItem("pre-gram-user", JSON.stringify(dummyUser))
      }
    }
  }, [status, user])

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
