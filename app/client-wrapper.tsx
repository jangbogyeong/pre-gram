"use client"

import type { ReactNode } from "react"
import dynamic from "next/dynamic"

// ClientProviders를 동적으로 임포트하고 SSR을 비활성화
const ClientProviders = dynamic(() => import("@/components/client-providers"), {
  ssr: false,
})

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>
}
