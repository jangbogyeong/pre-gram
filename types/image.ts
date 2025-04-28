export interface ImageType {
  id: string
  src: string
  file: File
  width: number
  height: number
  aspectRatio?: "4:5" | "16:9"
}

export type AspectRatioType = "4:5" | "16:9"
