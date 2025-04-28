import type { ReactNode } from "react"
import { ModeToggle } from "@/components/mode-toggle"

interface PageContainerProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  className?: string
}

export function PageContainer({ children, header, footer, className = "" }: PageContainerProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {header ? (
        header
      ) : (
        <header className="p-4 flex justify-end">
          <ModeToggle />
        </header>
      )}

      <main className="flex-1 flex flex-col">{children}</main>

      {footer ? (
        footer
      ) : (
        <footer className="p-4 text-center text-sm text-muted-foreground">
          © 2023 Pre-gram. Not affiliated with Instagram.
        </footer>
      )}
    </div>
  )
}
