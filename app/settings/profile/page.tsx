"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa"

export default function ProfileSettingsPage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  // 로그인 제공자에 따른 아이콘 렌더링
  const renderProviderIcon = () => {
    switch (user.provider) {
      case "google":
        return <FaGoogle className="h-5 w-5 mr-2 text-red-500" />
      case "apple":
        return <FaApple className="h-5 w-5 mr-2" />
      case "facebook":
        return <FaFacebook className="h-5 w-5 mr-2 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Manage your personal information and login details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <div className="mt-1 p-2 border rounded-md">{user.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="mt-1 p-2 border rounded-md">{user.email}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Connected With</label>
              <div className="mt-1 p-2 border rounded-md flex items-center">
                {renderProviderIcon()}
                <span className="capitalize">{user.provider}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>Manage your privacy settings and security options</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Privacy and security settings will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
