import { Card } from "@/components/ui/card"
import Post from "@/components/post"
import Stories from "@/components/stories"

export default function Feed() {
  // 샘플 포스트 데이터
  const posts = [
    {
      id: 1,
      user: {
        username: "janedoe",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      image: "/placeholder.svg?height=600&width=600",
      caption: "오늘의 일상 #데일리 #일상스타그램",
      likes: 120,
      comments: [
        {
          user: "johndoe",
          text: "멋진 사진이네요! 👍",
        },
        {
          user: "mike_smith",
          text: "좋은 하루 되세요! ☀️",
        },
      ],
      timestamp: "2시간 전",
    },
    {
      id: 2,
      user: {
        username: "traveler_kim",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      image: "/placeholder.svg?height=600&width=600",
      caption: "여행 중에 찍은 사진 #여행 #풍경 #여행스타그램",
      likes: 243,
      comments: [
        {
          user: "travel_lover",
          text: "어디인지 알려주세요! 너무 예쁘네요 😍",
        },
      ],
      timestamp: "5시간 전",
    },
    {
      id: 3,
      user: {
        username: "foodie_park",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      image: "/placeholder.svg?height=600&width=600",
      caption: "오늘의 점심 #맛스타그램 #먹스타그램 #맛집",
      likes: 98,
      comments: [
        {
          user: "chef_lee",
          text: "맛있어 보이네요! 어디 맛집인가요?",
        },
      ],
      timestamp: "7시간 전",
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card className="p-4 overflow-x-auto">
        <Stories />
      </Card>

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}
