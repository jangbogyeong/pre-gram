"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa"
import { motion } from "framer-motion"
import Image from "next/image"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleLogin = async (provider: string) => {
    try {
      setIsLoading(provider)
      await signIn(provider, { callbackUrl: "/connect-instagram" })
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4">
            <Image src="/placeholder.svg?height=96&width=96" alt="Pre-gram Logo" fill className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold">Pre-gram</h1>
          <p className="text-muted-foreground mt-2">Preview your Instagram feed before posting</p>
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
              onClick={() => handleLogin("google")}
              disabled={isLoading === "google"}
            >
              <FaGoogle className="h-5 w-5" />
              <span>{isLoading === "google" ? "Signing in..." : "Sign in with Google"}</span>
            </Button>
            <Button
              variant="outline"
              className="w-full py-6 flex items-center justify-center gap-2"
              onClick={() => handleLogin("apple")}
              disabled={isLoading === "apple"}
            >
              <FaApple className="h-5 w-5" />
              <span>{isLoading === "apple" ? "Signing in..." : "Sign in with Apple"}</span>
            </Button>
            <Button
              variant="outline"
              className="w-full py-6 flex items-center justify-center gap-2"
              onClick={() => handleLogin("facebook")}
              disabled={isLoading === "facebook"}
            >
              <FaFacebook className="h-5 w-5" />
              <span>{isLoading === "facebook" ? "Signing in..." : "Sign in with Facebook"}</span>
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
