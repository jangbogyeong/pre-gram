"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Instagram, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { Progress } from "@/components/ui/progress"

// 더미 인스타그램 계정 데이터
const dummyInstagramAccounts = [
  {
    id: "1",
    username: "your_username",
    profileImage: "/placeholder.svg?height=32&width=32",
    isConnected: true,
  },
]

export default function AccountsSettingsPage() {
  const { toast } = useToast()
  const { user, updateUser } = useAuth()
  const [accounts, setAccounts] = useState(dummyInstagramAccounts)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  // 사용자가 연결할 수 있는 최대 계정 수 (기본값: 1)
  const maxAccounts = user?.maxAccounts || 1

  // 현재 연결된 계정 수
  const connectedAccountsCount = accounts.length

  // 계정 슬롯 사용 비율
  const accountUsagePercentage = Math.round((connectedAccountsCount / maxAccounts) * 100)

  const handleAddAccount = () => {
    if (connectedAccountsCount >= maxAccounts) {
      // 최대 연결 가능 계정 수에 도달한 경우 결제 다이얼로그 표시
      setIsPaymentDialogOpen(true)
    } else {
      // 계정 연결 페이지로 이동
      toast({
        title: "Connect Instagram Account",
        description: "Redirecting to Instagram connection page...",
      })
      // 실제 구현에서는 여기서 계정 연결 페이지로 이동
    }
  }

  const handlePayment = () => {
    // 결제 처리 시뮬레이션
    setTimeout(() => {
      if (user) {
        // 결제 성공 후 최대 연결 가능 계정 수 증가
        const updatedUser = { ...user, maxAccounts: user.maxAccounts + 1 }
        updateUser(updatedUser)

        setIsPaymentDialogOpen(false)

        toast({
          title: "Payment Successful",
          description: "You can now connect one more Instagram account.",
        })

        // 계정 연결 페이지로 이동
        // 실제 구현에서는 여기서 계정 연결 페이지로 이동
      }
    }, 1000)
  }

  const handleDisconnect = (id: string) => {
    toast({
      title: "Account Disconnected",
      description: "Your Instagram account has been disconnected.",
    })
    setAccounts(accounts.filter((account) => account.id !== id))
  }

  // 새 계정 추가 시뮬레이션 (테스트용)
  const handleAddDummyAccount = () => {
    if (connectedAccountsCount < maxAccounts) {
      const newAccount = {
        id: `${Date.now()}`,
        username: `test_account_${accounts.length + 1}`,
        profileImage: "/placeholder.svg?height=32&width=32",
        isConnected: true,
      }
      setAccounts([...accounts, newAccount])

      toast({
        title: "Account Connected",
        description: `@${newAccount.username} has been connected.`,
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Connected Accounts</h1>
        <Button onClick={handleAddAccount} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {connectedAccountsCount >= maxAccounts ? (
            <span>Add account slot (₩9,900)</span>
          ) : (
            <span>Connect Account</span>
          )}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Slots</CardTitle>
          <CardDescription>
            You are using {connectedAccountsCount} of {maxAccounts} available account slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={accountUsagePercentage} className="h-2" />

            <div className="flex justify-between text-sm">
              <span>{connectedAccountsCount} connected</span>
              <span>{maxAccounts - connectedAccountsCount} available</span>
            </div>

            {connectedAccountsCount >= maxAccounts && (
              <Button
                onClick={() => setIsPaymentDialogOpen(true)}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Need more? Add another account slot for ₩9,900
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instagram Accounts</CardTitle>
          <CardDescription>Manage your connected Instagram accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={account.profileImage} alt={account.username} />
                      <AvatarFallback>
                        <Instagram className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">@{account.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {account.isConnected ? "Connected" : "Connection expired"}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDisconnect(account.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ))}

              {/* 테스트용 버튼 - 실제 구현에서는 제거 */}
              {connectedAccountsCount < maxAccounts && (
                <Button variant="outline" className="w-full mt-4" onClick={handleAddDummyAccount}>
                  <Plus className="h-4 w-4 mr-2" />
                  Simulate Adding Account (Test Only)
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Instagram className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Instagram Accounts Connected</h3>
              <p className="text-muted-foreground mb-4">Connect your Instagram account to preview your feed</p>
              <Button onClick={handleAddDummyAccount}>Connect Instagram Account</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 결제 다이얼로그 */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Another Account Slot</DialogTitle>
            <DialogDescription>You can add one more account slot for a one-time payment of ₩9,900.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-lg bg-primary-foreground p-4">
              <h3 className="font-semibold mb-2">Account Slot Information</h3>
              <p className="mb-4">
                You currently have {maxAccounts} account slot{maxAccounts > 1 ? "s" : ""} and are using{" "}
                {connectedAccountsCount} of them.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Add one more account slot
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Connect and manage multiple Instagram accounts
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Switch between accounts easily
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> One-time payment (not a subscription)
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Pay ₩9,900
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
