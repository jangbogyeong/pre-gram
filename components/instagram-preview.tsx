import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Grid } from "lucide-react"

export function InstagramPreview() {
  // 실제 구현에서는 이미지 배열을 받아서 렌더링하겠지만,
  // 여기서는 디자인만 보여주기 위한 더미 그리드를 생성합니다.
  const gridCells = Array.from({ length: 9 }).map((_, index) => index)

  return (
    <div className="bg-white dark:bg-black rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@username" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="font-semibold">@username</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[2px]">
        {gridCells.map((index) => (
          <div key={index} className="aspect-square relative bg-muted/30 flex items-center justify-center">
            <div className="text-muted-foreground opacity-30">
              <Grid className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src="/placeholder.svg?height=24&width=24" alt="@username" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <span className="font-semibold mr-2">@username</span>
            <span className="text-muted-foreground">9 posts</span>
          </div>
        </div>
      </div>
    </div>
  )
}
