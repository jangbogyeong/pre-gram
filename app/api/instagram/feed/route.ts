import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 여기서는 데이터베이스에서 사용자의 Instagram 토큰을 가져온다고 가정
    // const user = await db.user.findUnique({ where: { id: session.user.id } })
    // const instagramToken = user.instagramToken

    // 테스트용 더미 토큰
    const instagramToken = "DUMMY_TOKEN"

    if (!instagramToken) {
      return NextResponse.json({ error: "Instagram account not connected" }, { status: 400 })
    }

    // Instagram API에서 미디어 가져오기
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${instagramToken}`,
    )

    if (!mediaResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch Instagram media" }, { status: 400 })
    }

    const mediaData = await mediaResponse.json()

    // 이미지와 비디오만 필터링
    const filteredMedia = mediaData.data.filter(
      (item: any) => item.media_type === "IMAGE" || item.media_type === "VIDEO" || item.media_type === "CAROUSEL_ALBUM",
    )

    return NextResponse.json({ media: filteredMedia })
  } catch (error) {
    console.error("Instagram feed fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch Instagram feed" }, { status: 500 })
  }
}
