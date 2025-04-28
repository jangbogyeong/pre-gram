"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ImageType } from "@/types/image"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  images: ImageType[]
}

export default function PreviewModal({ isOpen, onClose, images }: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>인스타그램 미리보기</DialogTitle>
        </DialogHeader>

        <div className="bg-white dark:bg-black rounded-md overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@username" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="font-semibold">username</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[2px]">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-[4/5]">
                <Image src={image.src || "/placeholder.svg"} alt="Instagram post" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">단일 포스트 미리보기</h3>
          {images.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@username" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">username</span>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              <div className="relative aspect-[4/5]">
                <Image src={images[0].src || "/placeholder.svg"} alt="Instagram post" fill className="object-cover" />
              </div>

              <div className="p-3">
                <div className="flex justify-between mb-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Heart className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Send className="h-6 w-6" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Bookmark className="h-6 w-6" />
                  </Button>
                </div>

                <div className="text-sm font-semibold mb-1">123 likes</div>
                <div className="text-sm">
                  <span className="font-semibold">username</span> 게시물 설명이 여기에 표시됩니다.
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
