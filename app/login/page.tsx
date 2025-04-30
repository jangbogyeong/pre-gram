"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa"
import { motion } from "framer-motion"
import Image from "next/image"

export default function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-48 h-16 mb-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pregram%20logo-wDnlv8EUftA6IZFH1XLM7ePNSGWTC9.png"
              alt="Pregram Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">Sign in to continue</CardTitle>
            <CardDescription className="text-center">Choose your preferred sign in method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full py-6 flex items-center justify-center gap-2"
              onClick={() => login("google")}
            >
              <FaGoogle className="h-5 w-5" />
              <span>Sign in with Google</span>
            </Button>
            <Button
              variant="outline"
              className="w-full py-6 flex items-center justify-center gap-2"
              onClick={() => login("apple")}
            >
              <FaApple className="h-5 w-5" />
              <span>Sign in with Apple</span>
            </Button>
            <Button
              variant="outline"
              className="w-full py-6 flex items-center justify-center gap-2"
              onClick={() => login("facebook")}
            >
              <FaFacebook className="h-5 w-5" />
              <span>Sign in with Facebook</span>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
