"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProject } from "@/contexts/project-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowLeft, Download, Home } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import html2canvas from "html2canvas"

export default function PreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { projects, currentProject, setCurrentProject } = useProject()
  const { user } = useAuth()
  const { toast } = useToast()
  const previewRef = useRef<HTMLDivElement>(null)

  const projectId = searchParams.get("id")

  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        setCurrentProject(project)
      } else {
        toast({
          title: "Project not found",
          description: "The requested project could not be found.",
          variant: "destructive",
        })
        router.push("/select")
      }
    }
  }, [projectId, projects, setCurrentProject, router, toast])

  // 이미지 정렬 함수: 사용자 업로드 이미지를 먼저 표시
  const getSortedImages = () => {
    if (!currentProject) return []

    // 사용자가 업로드한 이미지와 기존 피드 이미지 분리
    const userUploaded = currentProject.images.filter((img) => img.isUserUploaded)
    const existingFeed = currentProject.images.filter((img) => !img.isUserUploaded)

    // 사용자 업로드 이미지를 먼저, 기존 피드 이미지를 나중에 합침
    return [...userUploaded, ...existingFeed]
  }

  const handleSaveAsImage = async () => {
    if (!previewRef.current || !currentProject) return

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        useCORS: true,
      })

      const link = document.createElement("a")
      link.download = `instagram-${currentProject.type}-preview.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast({
        title: "Image saved",
        description: `instagram-${currentProject.type}-preview.png`,
      })
    } catch (error) {
      console.error("Failed to save as image:", error)
      toast({
        title: "Failed to save image",
        variant: "destructive",
      })
    }
  }

  const handleBackToEdit = () => {
    if (currentProject) {
      router.push(`/editor?type=${currentProject.type}&id=${currentProject.id}`)
    } else {
      router.push("/select")
    }
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 정렬된 이미지 가져오기
  const sortedImages = getSortedImages()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={handleBackToEdit}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">Pre-gram Preview</h1>
        <ModeToggle />
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div ref={previewRef} className="bg-white dark:bg-black rounded-lg overflow-hidden shadow-lg mb-8">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={`@${user?.name || "username"}`} />
                  <AvatarFallback>{(user?.name || "U")[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="font-semibold">@{user?.name || "username"}</div>
              </div>
            </div>

            <div className={`grid grid-cols-3 gap-[1px]`}>
              {sortedImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative ${currentProject.type === "feed" ? "aspect-[4/5]" : "aspect-[9/16]"}`}
                >
                  <Image src={image.src || "/placeholder.svg"} alt="Instagram post" fill className="object-cover" />
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src="/placeholder.svg?height=24&width=24" alt={`@${user?.name || "username"}`} />
                  <AvatarFallback>{(user?.name || "U")[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <span className="font-semibold mr-2">@{user?.name || "username"}</span>
                  <span className="text-muted-foreground">{sortedImages.length} posts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button onClick={handleSaveAsImage} size="lg" className="w-full gap-2">
              <Download className="h-5 w-5" />
              Save as Image
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleBackToEdit} className="gap-2">
                <ArrowLeft className="h-5 w-5" />
                Back to Edit
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
                <Home className="h-5 w-5" />
                Home
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
