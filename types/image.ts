export interface ImageItem {
  id: string
  src: string
  file: File
  width: number
  height: number
  isUserUploaded?: boolean // 사용자가 업로드한 이미지인지 여부
}

export type ImageType = {
  id: string
  src: string
  file: File
  width: number
  height: number
  aspectRatio?: "4:5" | "16:9"
}
