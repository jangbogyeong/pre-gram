"use client"

import type { ReactNode } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  onBackClick?: () => void
  rightElement?: ReactNode
  className?: string
}

export function Header({ title, showBackButton = false, onBackClick, rightElement, className = "" }: HeaderProps) {
  return (
    <header className={`p-4 flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBackClick} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      <div>{rightElement || <ModeToggle />}</div>
    </header>
  )
}
