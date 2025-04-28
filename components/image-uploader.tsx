"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImagePlus, Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import type { ImageItem } from "@/contexts/project-context"

interface ImageUploaderProps {
  onUpload: (images: ImageItem[]) => void
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files))
    }
  }

  const processFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      toast({
        title: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    const newImages: ImageItem[] = []

    for (const file of imageFiles) {
      const reader = new FileReader()

      const imagePromise = new Promise<ImageItem>((resolve) => {
        reader.onload = (e) => {
          const result = e.target?.result as string

          // 이미지 크기 가져오기
          const img = new Image()
          img.onload = () => {
            resolve({
              id: uuidv4(),
              src: result,
              file: file,
              width: img.width,
              height: img.height,
              isUserUploaded: true, // 사용자가 업로드한 이미지임을 표시
            })
          }
          img.src = result
        }
        reader.readAsDataURL(file)
      })

      newImages.push(await imagePromise)
    }

    onUpload(newImages)

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Upload Images</h3>
            <p className="mt-2 text-sm text-muted-foreground">Drag and drop images or click to browse</p>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
