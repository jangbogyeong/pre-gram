import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Stories() {
  // 샘플 스토리 데이터
  const stories = [
    { id: 1, username: "your_story", avatar: "/placeholder.svg?height=64&width=64", isYours: true },
    { id: 2, username: "friend1", avatar: "/placeholder.svg?height=64&width=64" },
    { id: 3, username: "friend2", avatar: "/placeholder.svg?height=64&width=64" },
    { id: 4, username: "friend3", avatar: "/placeholder.svg?height=64&width=64" },
    { id: 5, username: "friend4", avatar: "/placeholder.svg?height=64&width=64" },
    { id: 6, username: "friend5", avatar: "/placeholder.svg?height=64&width=64" },
    { id: 7, username: "friend6", avatar: "/placeholder.svg?height=64&width=64" },
    { id: 8, username: "friend7", avatar: "/placeholder.svg?height=64&width=64" },
  ]

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1 min-w-[72px]">
          <div
            className={`p-[2px] rounded-full ${story.isYours ? "bg-gray-200" : "bg-gradient-to-tr from-yellow-400 to-pink-600"}`}
          >
            <Avatar className="w-16 h-16 border-2 border-white">
              <AvatarImage src={story.avatar} alt={story.username} />
              <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs truncate w-full text-center">{story.isYours ? "내 스토리" : story.username}</span>
        </div>
      ))}
    </div>
  )
}
