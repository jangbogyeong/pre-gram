import { Grid, ImageIcon } from "lucide-react"

interface ImageGridProps {
  type: "feed" | "reels"
  isReadOnly?: boolean
}

export function ImageGrid({ type, isReadOnly = false }: ImageGridProps) {
  // 실제 구현에서는 이미지 배열을 받아서 렌더링하겠지만,
  // 여기서는 디자인만 보여주기 위한 더미 그리드를 생성합니다.
  const gridCells = Array.from({ length: 9 }).map((_, index) => index)

  return (
    <div className="w-full">
      {gridCells.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-4 opacity-30" />
          <p>Upload images to start</p>
        </div>
      ) : (
        <div className={`grid grid-cols-3 gap-2`}>
          {gridCells.map((index) => (
            <div
              key={index}
              className={`bg-muted/50 rounded-md relative ${
                type === "feed" ? "aspect-[1/1]" : "aspect-[9/16]"
              } flex items-center justify-center cursor-${isReadOnly ? "default" : "move"}`}
            >
              <div className="text-muted-foreground opacity-30">
                <Grid className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
