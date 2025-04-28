import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Compass, Heart, Home, PlusSquare } from "lucide-react"

export default function MobileNavigation() {
  return (
    <div className="flex justify-around items-center py-3 px-2">
      <Link href="#" className="flex flex-col items-center">
        <Home className="h-6 w-6" />
      </Link>

      <Link href="#" className="flex flex-col items-center">
        <Compass className="h-6 w-6" />
      </Link>

      <Link href="#" className="flex flex-col items-center">
        <PlusSquare className="h-6 w-6" />
      </Link>

      <Link href="#" className="flex flex-col items-center">
        <Heart className="h-6 w-6" />
      </Link>

      <Link href="#" className="flex flex-col items-center">
        <Avatar className="h-6 w-6">
          <AvatarImage src="/placeholder.svg?height=24&width=24" alt="Profile" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </Link>
    </div>
  )
}
