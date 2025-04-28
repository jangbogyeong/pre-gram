import { v4 as uuidv4 } from "uuid"
import type { ImageItem } from "@/contexts/project-context"

// 더미 인스타그램 계정 데이터
export const dummyInstagramAccounts = [
  {
    id: "1",
    username: "your_username",
    profileImage: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    username: "second_account",
    profileImage: "/placeholder.svg?height=32&width=32&text=2nd",
  },
]

// 더미 피드 이미지 생성 함수
export function generateDummyFeedImages(count = 9): ImageItem[] {
  return Array.from({ length: count }).map((_, index) => {
    const id = uuidv4()
    return {
      id,
      src: `/placeholder.svg?height=600&width=480&text=Post+${index + 1}`,
      file: new File([""], `dummy-${id}.jpg`, { type: "image/jpeg" }),
      width: 480,
      height: 600,
      isUserUploaded: false, // 기존 피드 이미지는 사용자가 업로드한 것이 아님
    }
  })
}
