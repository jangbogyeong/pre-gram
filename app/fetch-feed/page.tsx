"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProject } from "@/contexts/project-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowLeft, Edit } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { generateDummyFeedImages } from "@/utils/dummy-data"

export default function FetchFeedPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createProject, addImagesToProject } = useProject()
  const [isLoading, setIsLoading] = useState(true)
  const [feedImages, setFeedImages] = useState<any[]>([])

  // 피드 이미지 로딩 시뮬레이션
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true)

      // 로딩 시간 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 더미 이미지 생성
      const dummyImages = generateDummyFeedImages(9).map((img, index) => ({
        id: img.id,
        src: img.src,
        caption: `인스타그램 게시물 #${index + 1} #여행 #일상`,
        likes: Math.floor(Math.random() * 200) + 50,
        comments: Math.floor(Math.random() * 30) + 1,
      }))

      setFeedImages(dummyImages)
      setIsLoading(false)
    }

    loadImages()
  }, [])

  const handleStartEditing = () => {
    // 새 프로젝트 생성
    const newProject = createProject("feed", "My Instagram Feed")

    // 이미지를 프로젝트에 추가 (isUserUploaded: false로 표시)
    const projectImages = generateDummyFeedImages(9)

    console.log("Adding feed images to project:", projectImages.length)

    // 프로젝트에 이미지 추가
    addImagesToProject(newProject.id, projectImages)

    // 에디터 페이지로 이동
    router.push(`/editor?type=feed&id=${newProject.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full">
      <header className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => router.push("/connect-instagram")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Your Instagram Feed</h1>
        <ModeToggle />
      </header>

      <div className="flex-1 px-0 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-2xl font-bold mb-2">Here's your current Instagram feed</h1>
            <p className="text-muted-foreground">
              This is your live feed. We'll use this to simulate how new posts would look.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-0 border-separate border-spacing-0">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] bg-muted/30 rounded-none overflow-hidden border border-background"
                >
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-muted/10 to-muted/30"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      background: [
                        "linear-gradient(to right, rgba(200,200,200,0.1), rgba(200,200,200,0.3))",
                        "linear-gradient(to right, rgba(200,200,200,0.3), rgba(200,200,200,0.1))",
                        "linear-gradient(to right, rgba(200,200,200,0.1), rgba(200,200,200,0.3))",
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="grid grid-cols-3 gap-0 border-separate border-spacing-0">
                {feedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="aspect-[4/5] bg-muted rounded-none overflow-hidden border border-background"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={image.src || "/placeholder.svg"}
                        alt={`Feed image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex justify-center"
          >
            <Button
              size="lg"
              className="px-8 py-6 text-lg rounded-xl gap-2"
              onClick={handleStartEditing}
              disabled={isLoading}
            >
              <Edit className="h-5 w-5" />
              Start Editing
            </Button>
          </motion.div>
        </div>
      </div>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        © 2023 Pre-gram. Not affiliated with Instagram.
      </footer>
    </div>
  )
}
