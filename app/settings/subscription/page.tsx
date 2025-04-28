"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Instagram, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AccountSlotsPage() {
  const { toast } = useToast()
  const { user, updateUser } = useAuth()
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  // 사용자가 연결할 수 있는 최대 계정 수 (기본값: 1)
  const maxAccounts = user?.maxAccounts || 1

  // 더미 데이터: 연결된 계정 수
  const connectedAccountsCount = 1 // 실제 구현에서는 실제 연결된 계정 수를 가져와야 함

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
      }
    }, 1000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Slots</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Account Slots</CardTitle>
          <CardDescription>Manage your Instagram account slots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Instagram className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">Basic Account Slot</h3>
                  <p className="text-sm text-muted-foreground">Your first account slot (free)</p>
                </div>
              </div>
              <div className="text-sm font-medium text-green-600">Active</div>
            </div>

            {maxAccounts > 1 &&
              Array.from({ length: maxAccounts - 1 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Instagram className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Additional Account Slot {index + 1}</h3>
                      <p className="text-sm text-muted-foreground">Purchased account slot</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-600">Active</div>
                </div>
              ))}

            <Button
              onClick={() => setIsPaymentDialogOpen(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Account Slot (₩9,900)
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Account Slot Information</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                <span>
                  You currently have {maxAccounts} account slot{maxAccounts > 1 ? "s" : ""}
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                <span>
                  You are using {connectedAccountsCount} of {maxAccounts} available slots
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                <span>Each additional slot costs ₩9,900 (one-time payment)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                <span>You can purchase as many slots as you need</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your past payments</CardDescription>
        </CardHeader>
        <CardContent>
          {maxAccounts > 1 ? (
            <div className="space-y-4">
              {Array.from({ length: maxAccounts - 1 }).map((_, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <div className="font-medium">Additional Account Slot {index + 1}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₩9,900</div>
                    <div className="text-sm text-green-600">Paid</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No payment history available.</p>
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
