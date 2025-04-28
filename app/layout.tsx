import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { ProjectProvider } from "@/contexts/project-context"
import { Toaster } from "@/components/ui/toaster"
import ClientWrapper from "./client-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pre-gram - Preview your Instagram feed",
  description: "Preview your Instagram feed before posting",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientWrapper>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
            <AuthProvider>
              <ProjectProvider>
                {children}
                <Toaster />
              </ProjectProvider>
            </AuthProvider>
          </ThemeProvider>
        </ClientWrapper>
      </body>
    </html>
  )
}
