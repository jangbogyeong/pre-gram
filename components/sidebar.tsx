import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Compass, Heart, Home, MessageCircle, PlusSquare, Search, Settings, User } from "lucide-react"

export default function Sidebar() {
  return (
    <div className="fixed h-full w-64 lg:w-72 border-r p-5 flex flex-col">
      <div className="py-4">
        <Image src="/placeholder.svg?height=40&width=120" alt="Instagram" width={120} height={40} className="mb-6" />
      </div>

      <nav className="flex-1 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-4 px-2" asChild>
          <Link href="#">
            <Home className="h-6 w-6" />
            <span className="font-medium">홈</span>
          </Link>
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-4 px-2" asChild>
          <Link href="#">
            <Search className="h-6 w-6" />
            <span className="font-medium">검색</span>
          </Link>
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-4 px-2" asChild>
          <Link href="#">
            <Compass className="h-6 w-6" />
            <span className="font-medium">탐색</span>
          </Link>
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-4 px-2" asChild>
          <Link href="#">
            <MessageCircle className="h-6 w-6" />
            <span className="font-medium">메시지</span>
          </Link>
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-4 px-2" asChild>
          <Link href="#">
            <Heart className="h-6 w-6" />
            <span className="font-medium">알림</span>
          </Link>
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-4 px-2" asChild>
          <Link href="#">
            <PlusSquare className="h-6 w-6" />
            <span className="font-medium">만들기</span>
          </Link>
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-4 px-2" asChild>
          <Link href="#">
            <User className="h-6 w-6" />
            <span className="font-medium">프로필</span>
          </Link>
        </Button>
      </nav>

      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-4 px-2" asChild>
          <Link href="#">
            <Settings className="h-6 w-6" />
            <span className="font-medium">더 보기</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
