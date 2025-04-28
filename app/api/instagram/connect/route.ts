import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { code } = await req.json()

    // Instagram API 토큰 교환 요청
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID || "",
        client_secret: process.env.INSTAGRAM_APP_SECRET || "",
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/instagram/callback`,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: "Failed to exchange token" }, { status: 400 })
    }

    // 장기 액세스 토큰 획득
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${tokenData.access_token}`,
    )

    const longLivedTokenData = await longLivedTokenResponse.json()

    if (!longLivedTokenResponse.ok) {
      return NextResponse.json({ error: "Failed to get long-lived token" }, { status: 400 })
    }

    // 사용자 정보 가져오기
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedTokenData.access_token}`,
    )

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to get user data" }, { status: 400 })
    }

    // 여기서 데이터베이스에 사용자 Instagram 정보 저장
    // 예: await db.user.update({ where: { id: session.user.id }, data: { instagramId: userData.id, instagramUsername: userData.username, instagramToken: longLivedTokenData.access_token } })

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
      },
    })
  } catch (error) {
    console.error("Instagram connection error:", error)
    return NextResponse.json({ error: "Failed to connect Instagram account" }, { status: 500 })
  }
}
