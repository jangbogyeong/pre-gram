"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, Instagram, Plus, Check, Trash2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { v4 as uuidv4 } from "uuid"

interface InstagramAccount {
  id: string
  username: string
  profileImage: string
}

interface InstagramAccountSelectorProps {
  accounts: InstagramAccount[]
  currentAccount: InstagramAccount
  onSelectAccount: (account: InstagramAccount) => void
}

export default function InstagramAccountSelector({
  accounts: initialAccounts,
  currentAccount: initialCurrentAccount,
  onSelectAccount,
}: InstagramAccountSelectorProps) {
  const { toast } = useToast()
  const { user, updateUser } = useAuth()
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false)
  const [newAccountUsername, setNewAccountUsername] = useState("")
  const [accounts, setAccounts] = useState<InstagramAccount[]>(initialAccounts)
  const [currentAccount, setCurrentAccount] = useState<InstagramAccount>(initialCurrentAccount)
  const initialLoadDone = useRef(false)

  // 사용자가 연결할 수 있는 최대 계정 수 (기본값: 1)
  const maxAccounts = user?.maxAccounts || 1

  // 현재 연결된 계정 수
  const connectedAccountsCount = accounts.length

  // 로컬 스토리지에서 계정 정보 불러오기 - 초기 로드 시에만 실행
  useEffect(() => {
    if (initialLoadDone.current) return

    const storedAccounts = localStorage.getItem("pre-gram-instagram-accounts")
    const storedCurrentAccountId = localStorage.getItem("pre-gram-current-instagram-account")

    if (storedAccounts) {
      try {
        const parsedAccounts = JSON.parse(storedAccounts)

        // 저장된 계정이 있으면 설정
        if (parsedAccounts.length > 0) {
          setAccounts(parsedAccounts)

          // 저장된 현재 계정이 있으면 설정
          if (storedCurrentAccountId) {
            const savedCurrentAccount = parsedAccounts.find(
              (acc: InstagramAccount) => acc.id === storedCurrentAccountId,
            )
            if (savedCurrentAccount) {
              setCurrentAccount(savedCurrentAccount)
              // 부모 컴포넌트에 알림 (초기 로드 시에만)
              onSelectAccount(savedCurrentAccount)
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse stored accounts:", error)
      }
    }

    initialLoadDone.current = true
  }, [onSelectAccount]) // 의존성 배열에서 accounts와 currentAccount 제거

  // 계정 정보가 변경될 때 로컬 스토리지에 저장
  useEffect(() => {
    if (initialLoadDone.current && accounts.length > 0) {
      localStorage.setItem("pre-gram-instagram-accounts", JSON.stringify(accounts))
    }
  }, [accounts])

  // 현재 계정이 변경될 때 로컬 스토리지에 저장
  useEffect(() => {
    if (initialLoadDone.current && currentAccount) {
      localStorage.setItem("pre-gram-current-instagram-account", currentAccount.id)
    }
  }, [currentAccount])

  const handleAddAccount = () => {
    if (connectedAccountsCount >= maxAccounts) {
      // 최대 연결 가능 계정 수에 도달한 경우 결제 다이얼로그 표시
      setIsPaymentDialogOpen(true)
    } else {
      // 계정 추가 다이얼로그 표시
      setIsAddAccountDialogOpen(true)
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

        // 계정 추가 다이얼로그 표시
        setIsAddAccountDialogOpen(true)
      }
    }, 1000)
  }

  const handleAccountSelect = (account: InstagramAccount) => {
    setCurrentAccount(account)
    onSelectAccount(account)
  }

  const handleDeleteAccount = (accountId: string) => {
    // 계정이 하나만 있으면 삭제 불가
    if (accounts.length <= 1) {
      toast({
        title: "Cannot delete account",
        description: "You must have at least one Instagram account.",
        variant: "destructive",
      })
      return
    }

    // 계정 목록에서 삭제
    const updatedAccounts = accounts.filter((acc) => acc.id !== accountId)
    setAccounts(updatedAccounts)

    toast({
      title: "Account Deleted",
      description: "The Instagram account has been removed.",
    })
  }

  const handleAddNewAccount = () => {
    if (!newAccountUsername.trim()) {
      toast({
        title: "Username required",
        description: "Please enter an Instagram username",
        variant: "destructive",
      })
      return
    }

    // 새 계정 생성
    const newAccount: InstagramAccount = {
      id: uuidv4(),
      username: newAccountUsername,
      profileImage: `/placeholder.svg?height=32&width=32&text=${newAccountUsername[0].toUpperCase()}`,
    }

    // 계정 목록에 추가
    const updatedAccounts = [...accounts, newAccount]
    setAccounts(updatedAccounts)

    // 새 계정을 현재 계정으로 설정
    setCurrentAccount(newAccount)
    onSelectAccount(newAccount)

    // 다이얼로그 닫기 및 상태 초기화
    setIsAddAccountDialogOpen(false)
    setNewAccountUsername("")

    toast({
      title: "Account Added",
      description: `@${newAccountUsername} has been added to your accounts.`,
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={currentAccount.profileImage} alt={currentAccount.username} />
                <AvatarFallback>
                  <Instagram className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">@{currentAccount.username}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Instagram Accounts</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* 현재 계정을 상단에 표시하고 체크 아이콘 추가 */}
            <DropdownMenuItem
              key={currentAccount.id}
              className="cursor-pointer bg-muted/50"
              onClick={() => handleAccountSelect(currentAccount)}
            >
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={currentAccount.profileImage} alt={currentAccount.username} />
                <AvatarFallback>
                  <Instagram className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="flex-1">@{currentAccount.username}</span>
              <Check className="h-4 w-4 ml-2 text-primary" />
            </DropdownMenuItem>

            {/* 다른 계정들 표시 */}
            {accounts
              .filter((account) => account.id !== currentAccount.id)
              .map((account) => (
                <DropdownMenuItem key={account.id} className="cursor-pointer flex justify-between">
                  <div className="flex items-center flex-1" onClick={() => handleAccountSelect(account)}>
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={account.profileImage} alt={account.username} />
                      <AvatarFallback>
                        <Instagram className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span>@{account.username}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAccount(account.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuItem>
              ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-muted-foreground py-1 px-2">
              You can connect {connectedAccountsCount} of {maxAccounts} accounts
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleAddAccount}>
              <Plus className="h-4 w-4 mr-2" />
              {connectedAccountsCount >= maxAccounts ? (
                <span>Add another account slot (₩9,900)</span>
              ) : (
                <span>Add Account</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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

      {/* 계정 추가 다이얼로그 */}
      <Dialog open={isAddAccountDialogOpen} onOpenChange={setIsAddAccountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Instagram Account</DialogTitle>
            <DialogDescription>Enter your Instagram username to connect your account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Instagram Username</Label>
              <div className="flex items-center">
                <span className="mr-2">@</span>
                <Input
                  id="username"
                  placeholder="username"
                  value={newAccountUsername}
                  onChange={(e) => setNewAccountUsername(e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              In a real app, this would connect to the Instagram API. For this demo, we'll just simulate adding the
              account.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAccountDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewAccount}>Add Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
