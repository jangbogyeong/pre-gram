"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send, Smile } from "lucide-react"

interface PostProps {
  post: {
    id: number
    user: {
      username: string
      avatar: string
    }
    image: string
    caption: string
    likes: number
    comments: {
      user: string
      text: string
    }[]
    timestamp: string
  }
}

export default function Post({ post }: PostProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [comment, setComment] = useState("")
  const [showAllComments, setShowAllComments] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim()) {
      // 실제 구현에서는 여기서 댓글을 추가하는 로직이 들어갑니다
      setComment("")
    }
  }

  const displayedComments = showAllComments ? post.comments : post.comments.slice(0, 2)

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-4 pb-0 flex flex-row items-center space-y-0">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.user.avatar} alt={post.user.username} />
            <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <Link href="#" className="font-semibold text-sm">
            {post.user.username}
          </Link>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <div className="relative aspect-square">
          <Image src={post.image || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 pt-2 space-y-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLike} className="rounded-full">
              <Heart className={`h-6 w-6 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSave} className="rounded-full">
            <Bookmark className={`h-6 w-6 ${saved ? "fill-black" : ""}`} />
          </Button>
        </div>

        <div className="text-sm font-semibold">{post.likes.toLocaleString()} 좋아요</div>

        <div className="text-sm w-full">
          <span className="font-semibold">{post.user.username}</span> <span>{post.caption}</span>
        </div>

        {post.comments.length > 0 && (
          <div className="text-sm w-full space-y-1">
            {post.comments.length > 2 && !showAllComments && (
              <button onClick={() => setShowAllComments(true)} className="text-gray-500 text-sm">
                댓글 {post.comments.length}개 모두 보기
              </button>
            )}

            {displayedComments.map((comment, index) => (
              <div key={index}>
                <span className="font-semibold">{comment.user}</span> <span>{comment.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-gray-500 text-xs">{post.timestamp}</div>

        <form onSubmit={handleComment} className="flex items-center w-full mt-2 border-t pt-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Smile className="h-6 w-6" />
          </Button>
          <Input
            type="text"
            placeholder="댓글 달기..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
          />
          <Button type="submit" variant="ghost" className="text-blue-500 font-semibold" disabled={!comment.trim()}>
            게시
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
