"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProject } from "@/contexts/project-context"
import { useAuth } from "@/contexts/auth-context"
import { ModeToggle } from "@/components/mode-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { v4 as uuidv4 } from "uuid"
import type { ImageItem } from "@/contexts/project-context"
import FeedCarousel from "@/components/feed-carousel"
import { useToast } from "@/hooks/use-toast"
import UserProfileMenu from "@/components/user-profile-menu"
import InstagramAccountSelector from "@/components/instagram-account-selector"
import { generateDummyFeedImages, dummyInstagramAccounts } from "@/utils/dummy-data"
import MobileNavigation from "@/components/mobile-navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import LayoutCard from "@/components/layout-card"
import Image from "next/image"

interface Layout {
  id: string
  images: ImageItem[]
}

interface AccountLayouts {
  [accountId: string]: {
    layouts: Layout[]
    projectId: string
  }
}

export default function EditorPage() {
  // 추가로 페이지 이동 시 메모리 누수 방지를 위한 수정

  // 컴포넌트 최상단에 마운트 상태 추가
  const isMountedRef = useRef(true)

  const isMobile = useMediaQuery("(max-width: 768px)")
  const [activeLayoutIndex, setActiveLayoutIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("layouts")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { projects, currentProject, setCurrentProject, addImagesToProject, reorderImages, removeImage, createProject } =
    useProject()
  const { user } = useAuth()
  const { toast } = useToast()
  const carouselRef = useRef<HTMLDivElement>(null)
  const projectInitializedRef = useRef(false)
  const layoutsInitializedRef = useRef(false)
  const accountSwitchingRef = useRef(false)
  const isUpdatingLayoutsRef = useRef(false)
  const pendingLayoutUpdateRef = useRef<Layout[] | null>(null)
  const dataLoadedRef = useRef(false) // 데이터 로드 여부를 추적하는 새 ref
  const dummyImagesAddedRef = useRef(false) // 더미 이미지 추가 여부를 추적하는 새 ref

  const projectId = searchParams.get("id")
  const type = searchParams.get("type") || "feed"

  // 레이아웃 관련 상태
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [accountLayouts, setAccountLayouts] = useState<AccountLayouts>({})
  const [isLoading, setIsLoading] = useState(true) // 로딩 상태 추가
  // 에러 처리 및 안전한 상태 관리를 위한 수정

  // 1. 에러 상태 추가
  const [error, setError] = useState<string | null>(null)

  // 현재 선택된 인스타그램 계정
  const [accounts, setAccounts] = useState(dummyInstagramAccounts)
  const [currentAccount, setCurrentAccount] = useState(dummyInstagramAccounts[0])

  // 피드백 메시지 표시 후 자동으로 사라지게 하는 함수
  const showFeedback = useCallback((message: string) => {
    if (!isMountedRef.current) return // 컴포넌트가 언마운트되었으면 중단

    setFeedbackMessage(message)
    setTimeout(() => {
      if (isMountedRef.current) {
        // 타이머 완료 시에도 마운트 상태 확인
        setFeedbackMessage("")
      }
    }, 3000)
  }, [])

  // 로컬 스토리지에서 계정별 레이아웃 데이터 불러오기 - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    const loadAccountLayouts = () => {
      console.log("EditorPage: Loading account layouts from localStorage")
      setIsLoading(true)

      try {
        const storedAccountLayouts = localStorage.getItem("pre-gram-account-layouts")
        if (storedAccountLayouts) {
          try {
            const parsedAccountLayouts = JSON.parse(storedAccountLayouts)
            console.log("EditorPage: Loaded account layouts:", parsedAccountLayouts)
            setAccountLayouts(parsedAccountLayouts)
          } catch (parseError) {
            console.error("EditorPage: Failed to parse stored account layouts:", parseError)
            // 파싱 실패 시 빈 객체로 초기화
            setAccountLayouts({})
            localStorage.removeItem("pre-gram-account-layouts")
          }
        } else {
          console.log("EditorPage: No account layouts found in localStorage")
        }
      } catch (error) {
        console.error("EditorPage: Error accessing localStorage:", error)
      }

      dataLoadedRef.current = true
      setIsLoading(false)
    }

    // Only load once on mount
    if (!dataLoadedRef.current) {
      loadAccountLayouts()
    }
  }, []) // Empty dependency array to ensure it only runs once on mount

  // 계정별 레이아웃 데이터 저장 - 디바운스 처리
  useEffect(() => {
    // Only save if we have data and it's been loaded initially
    if (Object.keys(accountLayouts).length > 0 && dataLoadedRef.current) {
      console.log("EditorPage: Saving account layouts to localStorage:", accountLayouts)
      const saveTimeout = setTimeout(() => {
        try {
          localStorage.setItem("pre-gram-account-layouts", JSON.stringify(accountLayouts))
        } catch (error) {
          console.error("EditorPage: Error saving account layouts:", error)
        }
      }, 500) // 500ms 디바운스

      return () => clearTimeout(saveTimeout)
    }
  }, [accountLayouts])

  // 프로젝트 초기화 - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    const initializeProject = () => {
      if (projectId && !projectInitializedRef.current) {
        console.log(`EditorPage: Initializing project with ID ${projectId}`)
        setIsLoading(true)

        try {
          const project = projects.find((p) => p.id === projectId)
          if (project) {
            console.log("EditorPage: Found project:", project)
            setCurrentProject(project)
            projectInitializedRef.current = true
          } else {
            console.log(`EditorPage: Project with ID ${projectId} not found, creating new project`)
            // 프로젝트가 없으면 새로 생성 (type 파라미터 사용)
            const newProject = createProject(type as "feed" | "reels")

            // 새 프로젝트 ID로 URL 업데이트
            if (newProject.id !== projectId) {
              router.replace(`/editor?type=${type}&id=${newProject.id}`)
              return // 라우터 변경 후 추가 로직 실행 방지
            } else {
              projectInitializedRef.current = true
            }
          }
        } catch (err) {
          console.error("Error initializing project:", err)
          setError("프로젝트 초기화 중 오류가 발생했습니다.")
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (!projectInitializedRef.current) {
      initializeProject()
    }
  }, [projectId, projects, setCurrentProject, createProject, router, type])

  // 더미 이미지 추가 함수
  const addDummyImagesToProject = useCallback(() => {
    if (!currentProject || dummyImagesAddedRef.current) return

    console.log("EditorPage: Adding dummy images to project")

    // 더미 이미지 생성
    const dummyImages = generateDummyFeedImages(9)

    // 프로젝트에 더미 이미지 추가
    addImagesToProject(currentProject.id, dummyImages)

    // 더미 이미지 추가 완료 표시
    dummyImagesAddedRef.current = true

    return dummyImages
  }, [currentProject, addImagesToProject])

  // 안전하게 레이아웃 업데이트하는 함수
  const safelyUpdateLayouts = useCallback((newLayouts: Layout[]) => {
    if (!isMountedRef.current) return // 컴포넌트가 언마운트되었으면 상태 업데이트 중단

    if (isUpdatingLayoutsRef.current) {
      // 이미 업데이트 중이면 대기열에 추가
      console.log("EditorPage: Layout update already in progress, queueing update")
      pendingLayoutUpdateRef.current = newLayouts
      return
    }

    isUpdatingLayoutsRef.current = true
    console.log("EditorPage: Updating layouts:", newLayouts)

    // 마운트 상태 확인 후 상태 업데이트
    if (isMountedRef.current) {
      setLayouts(newLayouts)
    }

    // 업데이트 완료 후 플래그 리셋
    setTimeout(() => {
      if (!isMountedRef.current) return // 컴포넌트가 언마운트되었으면 중단

      isUpdatingLayoutsRef.current = false

      // 대기 중인 업데이트가 있으면 처리
      if (pendingLayoutUpdateRef.current && isMountedRef.current) {
        console.log("EditorPage: Processing queued layout update")
        const pendingUpdate = pendingLayoutUpdateRef.current
        pendingLayoutUpdateRef.current = null
        safelyUpdateLayouts(pendingUpdate)
      }
    }, 0)
  }, [])

  // 초기 레이아웃 생성 함수
  const createInitialLayout = useCallback(() => {
    if (!currentProject) return

    // 더미 이미지 추가
    const dummyImages = addDummyImagesToProject() || []

    // 프로젝트에 이미지가 있는지 확인
    if (currentProject.images.length > 0 || dummyImages.length > 0) {
      console.log(
        "EditorPage: Creating initial layout with project images:",
        currentProject.images.length > 0 ? currentProject.images.length : dummyImages.length,
      )

      // 사용자 업로드 이미지와 기존 피드 이미지 분리
      const userUploadedImages = currentProject.images.filter((img) => img.isUserUploaded === true)
      const existingFeedImages = currentProject.images.filter((img) => img.isUserUploaded !== true)

      // 더미 이미지가 없고 기존 피드 이미지도 없으면 더미 이미지 사용
      const feedImages = existingFeedImages.length > 0 ? existingFeedImages : dummyImages

      // 사용자 업로드 이미지를 먼저, 기존 피드 이미지를 나중에 배치
      const initialLayout = {
        id: uuidv4(),
        images: [...userUploadedImages, ...feedImages],
      }

      safelyUpdateLayouts([initialLayout])
      layoutsInitializedRef.current = true

      // 계정 레이아웃 데이터 저장
      if (currentAccount?.id && currentProject) {
        console.log(`EditorPage: Saving initial layout for account ${currentAccount.id}`)
        setAccountLayouts((prev) => ({
          ...prev,
          [currentAccount.id]: {
            layouts: [initialLayout],
            projectId: currentProject.id,
          },
        }))
      }
    } else {
      console.log("EditorPage: Creating empty initial layout")
      // 프로젝트에 이미지가 없는 경우 빈 레이아웃 생성
      const emptyLayout = {
        id: uuidv4(),
        images: [],
      }
      safelyUpdateLayouts([emptyLayout])
      layoutsInitializedRef.current = true

      // 계정 레이아웃 데이터 저장
      if (currentAccount?.id && currentProject) {
        console.log(`EditorPage: Saving empty initial layout for account ${currentAccount.id}`)
        setAccountLayouts((prev) => ({
          ...prev,
          [currentAccount.id]: {
            layouts: [emptyLayout],
            projectId: currentProject.id,
          },
        }))
      }
    }
  }, [currentProject, currentAccount, safelyUpdateLayouts, setAccountLayouts, addDummyImagesToProject])

  // 현재 계정이 변경될 때 해당 계정의 레이아웃 불러오기
  useEffect(() => {
    const loadAccountLayouts = () => {
      if (
        !currentAccount?.id ||
        !projectInitializedRef.current ||
        accountSwitchingRef.current ||
        !dataLoadedRef.current
      ) {
        return
      }

      console.log(`EditorPage: Loading layouts for account ${currentAccount.id}`)
      setIsLoading(true)

      try {
        // 현재 계정의 레이아웃 데이터가 있는지 확인
        const accountData = accountLayouts[currentAccount.id]

        if (accountData && accountData.projectId && accountData.layouts) {
          console.log("EditorPage: Found account data:", accountData)
          // 해당 계정의 프로젝트 ID와 레이아웃 불러오기
          const storedProjectId = accountData.projectId
          const storedLayouts = accountData.layouts

          // 프로젝트 ID가 변경되었으면 URL 업데이트
          if (projectId !== storedProjectId) {
            console.log(`EditorPage: Project ID mismatch, redirecting to stored project ID ${storedProjectId}`)
            router.replace(`/editor?type=${type}&id=${storedProjectId}`)
            return // 라우터 변경 후 추가 로직 실행 방지
          }

          // 프로젝트 설정
          const project = projects.find((p) => p.id === storedProjectId)
          if (project) {
            console.log("EditorPage: Setting current project:", project)
            setCurrentProject(project)
          } else {
            // 프로젝트를 찾지 못한 경우 새 프로젝트 생성
            console.log(`EditorPage: Project with ID ${storedProjectId} not found, creating new project`)
            const newProject = createProject(type as "feed" | "reels")

            // 계정 레이아웃 데이터 업데이트
            setAccountLayouts((prev) => ({
              ...prev,
              [currentAccount.id]: {
                ...prev[currentAccount.id],
                projectId: newProject.id,
              },
            }))

            // 새 프로젝트 ID로 URL 업데이트
            router.replace(`/editor?type=${type}&id=${newProject.id}`)
            return // 라우터 변경 후 추가 로직 실행 방지
          }

          // 레이아웃 설정
          if (storedLayouts && Array.isArray(storedLayouts) && storedLayouts.length > 0) {
            console.log("EditorPage: Setting layouts from account data:", storedLayouts)
            safelyUpdateLayouts(storedLayouts)
            layoutsInitializedRef.current = true
          } else {
            console.log("EditorPage: No valid layouts found in account data, creating initial layout")
            // 레이아웃이 없으면 초기 레이아웃 생성
            createInitialLayout()
          }
        } else if (currentProject) {
          console.log("EditorPage: No account data found, creating initial layout")
          // 계정 데이터가 없으면 현재 프로젝트로 초기 레이아웃 생성
          createInitialLayout()
        } else {
          // 현재 프로젝트가 없는 경우 새 프로젝트 생성
          console.log("EditorPage: No current project, creating new project")
          const newProject = createProject(type as "feed" | "reels")
          router.replace(`/editor?type=${type}&id=${newProject.id}`)
          return // 라우터 변경 후 추가 로직 실행 방지
        }
      } catch (error) {
        console.error("Error loading layouts:", error)
        setError("레이아웃을 불러오는 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    // Add a check to prevent repeated calls
    if (
      currentAccount?.id &&
      !layoutsInitializedRef.current &&
      projectInitializedRef.current &&
      dataLoadedRef.current &&
      !accountSwitchingRef.current
    ) {
      loadAccountLayouts()
    }
  }, [
    currentAccount?.id,
    projectId,
    currentProject,
    projects,
    setCurrentProject,
    router,
    accountLayouts,
    safelyUpdateLayouts,
    createInitialLayout,
    type,
    createProject,
  ])

  // 컴포넌트 마운트 시 더미 이미지 추가
  useEffect(() => {
    if (currentProject && !dummyImagesAddedRef.current && projectInitializedRef.current) {
      console.log("EditorPage: Adding dummy images on mount")
      dummyImagesAddedRef.current = true
      addDummyImagesToProject()
    }
  }, [currentProject, addDummyImagesToProject, projectInitializedRef.current])

  // 레이아웃 변경 시 계정 레이아웃 데이터 저장 - 디바운스 처리
  useEffect(() => {
    if (
      !currentAccount?.id ||
      !layoutsInitializedRef.current ||
      !currentProject ||
      accountSwitchingRef.current ||
      !dataLoadedRef.current ||
      layouts.length === 0
    )
      return

    console.log(`EditorPage: Layouts changed, updating account layouts for account ${currentAccount.id}`)
    const saveTimeout = setTimeout(() => {
      setAccountLayouts((prev) => {
        // Check if we're actually making a change to avoid unnecessary updates
        const currentLayouts = prev[currentAccount.id]?.layouts || []
        if (JSON.stringify(currentLayouts) === JSON.stringify(layouts)) {
          return prev // No change needed
        }

        const updatedAccountLayouts = {
          ...prev,
          [currentAccount.id]: {
            layouts: layouts,
            projectId: currentProject.id,
          },
        }
        console.log("EditorPage: Updated account layouts:", updatedAccountLayouts)
        return updatedAccountLayouts
      })
    }, 500) // 500ms 디바운스

    return () => clearTimeout(saveTimeout)
  }, [layouts, currentAccount?.id, currentProject])

  // 인스타그램 계정 변경 핸들러 - useCallback으로 메모이제이션
  const handleAccountChange = useCallback(
    (account: any) => {
      console.log(`EditorPage: Switching to account ${account.id}`)
      // 계정 전환 중임을 표시
      accountSwitchingRef.current = true
      layoutsInitializedRef.current = false
      dummyImagesAddedRef.current = false
      setIsLoading(true)

      // 현재 레이아웃 데이터 저장
      if (currentAccount?.id && currentProject) {
        console.log(`EditorPage: Saving layouts for current account ${currentAccount.id} before switching`)
        setAccountLayouts((prev) => ({
          ...prev,
          [currentAccount.id]: {
            layouts: layouts,
            projectId: currentProject?.id || "",
          },
        }))
      }

      // 현재 계정 변경
      setCurrentAccount(account)
      showFeedback(`Switched to @${account.username}`)

      // 계정 전환 완료 - 약간의 지연 후 플래그 리셋
      setTimeout(() => {
        accountSwitchingRef.current = false
        setIsLoading(false)
      }, 100)
    },
    [currentAccount, currentProject, layouts, showFeedback],
  )

  // 특정 레이아웃에만 이미지 추가 - 완전히 재작성
  const handleAddImagesToLayout = useCallback(
    (layoutId: string, newImages: ImageItem[]) => {
      if (!newImages || newImages.length === 0) {
        console.warn("EditorPage: No images to add")
        return
      }

      console.log(`EditorPage: Adding ${newImages.length} images to layout ${layoutId}`, newImages)

      // 이미지 데이터 검증
      const validImages = newImages.filter((img) => {
        if (!img.id || !img.src || !img.file) {
          console.error("EditorPage: Invalid image data", img)
          return false
        }
        return true
      })

      if (validImages.length === 0) {
        console.error("EditorPage: No valid images to add")
        return
      }

      console.log(`EditorPage: ${validImages.length} valid images to add`)

      // 현재 프로젝트에 이미지 추가
      if (currentProject) {
        // 프로젝트 컨텍스트의 addImagesToProject 함수 호출
        addImagesToProject(currentProject.id, validImages)

        // 레이아웃에 이미지 추가 - 동기적으로 처리
        setLayouts((prevLayouts) => {
          const updatedLayouts = prevLayouts.map((layout) => {
            if (layout.id === layoutId) {
              // 기존 이미지를 사용자 업로드 이미지와 기존 피드 이미지로 분리
              const userUploadedImages = layout.images.filter((img) => img.isUserUploaded === true)
              const existingFeedImages = layout.images.filter((img) => img.isUserUploaded !== true)

              // 새 이미지를 사용자 업로드 이미지 앞에 추가하고, 기존 피드 이미지는 맨 뒤에 배치
              return {
                ...layout,
                images: [...validImages, ...userUploadedImages, ...existingFeedImages],
              }
            }
            return layout
          })

          console.log("EditorPage: Updated layouts after adding images:", updatedLayouts)
          return updatedLayouts
        })

        // 계정 레이아웃 데이터 즉시 저장
        if (currentAccount?.id) {
          setAccountLayouts((prev) => {
            const updatedLayouts =
              prev[currentAccount.id]?.layouts.map((layout) => {
                if (layout.id === layoutId) {
                  // 기존 이미지를 사용자 업로드 이미지와 기존 피드 이미지로 분리
                  const userUploadedImages = layout.images.filter((img) => img.isUserUploaded === true)
                  const existingFeedImages = layout.images.filter((img) => img.isUserUploaded !== true)

                  // 새 이미지를 사용자 업로드 이미지 앞에 추가하고, 기존 피드 이미지는 맨 뒤에 배치
                  return {
                    ...layout,
                    images: [...validImages, ...userUploadedImages, ...existingFeedImages],
                  }
                }
                return layout
              }) || []

            const result = {
              ...prev,
              [currentAccount.id]: {
                layouts:
                  updatedLayouts.length > 0
                    ? updatedLayouts
                    : layouts.map((layout) => {
                        if (layout.id === layoutId) {
                          // 기존 이미지를 사용자 업로드 이미지와 기존 피드 이미지로 분리
                          const userUploadedImages = layout.images.filter((img) => img.isUserUploaded === true)
                          const existingFeedImages = layout.images.filter((img) => img.isUserUploaded !== true)

                          // 새 이미지를 사용자 업로드 이미지 앞에 추가하고, 기존 피드 이미지는 맨 뒤에 배치
                          return {
                            ...layout,
                            images: [...validImages, ...userUploadedImages, ...existingFeedImages],
                          }
                        }
                        return layout
                      }),
                projectId: currentProject.id,
              },
            }

            console.log("EditorPage: Updated account layouts after adding images:", result)
            return result
          })
        }

        // 간결한 피드백 메시지
        showFeedback(`${validImages.length}개의 이미지가 추가되었습니다`)
      } else {
        console.error("EditorPage: No current project found")
      }
    },
    [addImagesToProject, currentProject, currentAccount, layouts, showFeedback],
  )

  // 레이아웃 이미지 재정렬
  const handleLayoutReorder = useCallback(
    (layoutId: string, reorderedImages: ImageItem[]) => {
      console.log(`EditorPage: Reordering images in layout ${layoutId}`, reorderedImages)

      // 레이아웃 상태 업데이트 - 명시적으로 새 배열 생성
      setLayouts((prevLayouts) => {
        const updatedLayouts = prevLayouts.map((layout) => {
          if (layout.id === layoutId) {
            return { ...layout, images: [...reorderedImages] }
          }
          return layout
        })

        console.log(`EditorPage: Updated layouts after reordering`, updatedLayouts)
        return updatedLayouts
      })

      // 현재 프로젝트의 이미지도 업데이트
      if (currentProject) {
        console.log(`EditorPage: Updating project images after reordering`)
        reorderImages(currentProject.id, reorderedImages)
      }

      // 계정 레이아웃 데이터 즉시 저장
      if (currentAccount?.id) {
        setAccountLayouts((prev) => {
          const updatedLayouts =
            prev[currentAccount.id]?.layouts.map((layout) => {
              if (layout.id === layoutId) {
                return { ...layout, images: [...reorderedImages] }
              }
              return layout
            }) || []

          const result = {
            ...prev,
            [currentAccount.id]: {
              layouts: updatedLayouts.length > 0 ? updatedLayouts : layouts,
              projectId: currentProject?.id || "",
            },
          }

          console.log("EditorPage: Updated account layouts after reordering:", result)
          return result
        })
      }
    },
    [currentProject, reorderImages, currentAccount, layouts],
  )

  // 레이아웃에서 이미지 제거
  const handleLayoutRemoveImage = useCallback(
    (layoutId: string, imageId: string) => {
      console.log(`EditorPage: Removing image ${imageId} from layout ${layoutId}`)

      const layout = layouts.find((l) => l.id === layoutId)
      if (!layout) {
        console.error(`EditorPage: Layout with id ${layoutId} not found for image removal`)
        return
      }

      // 이미지가 사용자 업로드 이미지인지 확인
      const imageToRemove = layout.images.find((img) => img.id === imageId)

      if (imageToRemove && imageToRemove.isUserUploaded) {
        // 레이아웃 상태 업데이트 - 명시적으로 새 배열 생성
        setLayouts((prevLayouts) => {
          const updatedLayouts = prevLayouts.map((layout) => {
            if (layout.id === layoutId) {
              const filteredImages = layout.images.filter((img) => img.id !== imageId)
              console.log(`EditorPage: Layout ${layoutId} now has ${filteredImages.length} images after removal`)
              return { ...layout, images: filteredImages }
            }
            return layout
          })

          console.log(`EditorPage: Updated layouts after image removal`, updatedLayouts)
          return updatedLayouts
        })

        // 현재 프로젝트에서도 이미지 제거
        if (currentProject) {
          console.log(`EditorPage: Removing image ${imageId} from current project ${currentProject.id}`)
          removeImage(currentProject.id, imageId)
        }

        // 계정 레이아웃 데이터 즉시 저장
        if (currentAccount?.id) {
          setAccountLayouts((prev) => {
            const updatedLayouts =
              prev[currentAccount.id]?.layouts.map((layout) => {
                if (layout.id === layoutId) {
                  return {
                    ...layout,
                    images: layout.images.filter((img) => img.id !== imageId),
                  }
                }
                return layout
              }) || []

            const result = {
              ...prev,
              [currentAccount.id]: {
                layouts: updatedLayouts.length > 0 ? updatedLayouts : layouts,
                projectId: currentProject?.id || "",
              },
            }

            console.log("EditorPage: Updated account layouts after image removal:", result)
            return result
          })
        }

        // 피드백 메시지
        showFeedback("Image removed")
      } else {
        // 기존 피드 이미지는 삭제할 수 없음을 알림
        showFeedback("Only uploaded images can be removed")
      }
    },
    [currentProject, layouts, removeImage, showFeedback, currentAccount],
  )

  // 레이아웃 복제 - 완전히 개선된 버전
  const handleDuplicateLayout = useCallback(
    (layoutId: string) => {
      const layoutToDuplicate = layouts.find((l) => l.id === layoutId)
      if (!layoutToDuplicate) {
        console.error(`EditorPage: Layout with id ${layoutId} not found for duplication`)
        return
      }

      console.log(`EditorPage: Duplicating layout ${layoutId} with ${layoutToDuplicate.images.length} images`)

      // 이미지 객체를 완전히 깊은 복사하여 독립적인 객체로 만듦
      const duplicatedImages = layoutToDuplicate.images.map((img) => {
        // 새로운 File 객체 생성 (원본 파일의 복사본)
        const fileCopy = new File([img.file], img.file.name, {
          type: img.file.type,
          lastModified: img.file.lastModified,
        })

        // 완전히 새로운 이미지 객체 생성
        return {
          // 사용자 업로드 이미지만 새 ID 부여, 기존 이미지는 원래 ID 유지
          id: img.isUserUploaded ? uuidv4() : img.id,
          src: img.src,
          file: fileCopy,
          width: img.width,
          height: img.height,
          isUserUploaded: img.isUserUploaded, // isUserUploaded 플래그 유지
        }
      })

      // 새로운 레이아웃 ID 생성
      const newLayoutId = uuidv4()

      // 완전히 새로운 레이아웃 객체 생성
      const duplicatedLayout = {
        id: newLayoutId,
        images: duplicatedImages,
      }

      console.log(`EditorPage: Created duplicated layout with id ${newLayoutId}`)

      // 애니메이션 효과를 위해 새 레이아웃 추가
      setLayouts((prevLayouts) => {
        const updatedLayouts = [...prevLayouts, duplicatedLayout]
        console.log("EditorPage: Updated layouts after duplication:", updatedLayouts)
        return updatedLayouts
      })

      // 계정 레이아웃 데이터 즉시 저장
      if (currentAccount?.id && currentProject) {
        setAccountLayouts((prev) => {
          const updatedLayouts = [...(prev[currentAccount.id]?.layouts || []), duplicatedLayout]

          const result = {
            ...prev,
            [currentAccount.id]: {
              layouts: updatedLayouts,
              projectId: currentProject.id,
            },
          }

          console.log("EditorPage: Updated account layouts after duplication:", result)
          return result
        })
      }

      // 새 레이아웃이 보이도록 스크롤 처리
      setTimeout(() => {
        const container = document.querySelector(".scrollbar-hide")
        if (container) {
          container.scrollLeft = container.scrollWidth
        }
      }, 100)

      // 간결한 피드백 메시지
      showFeedback("Layout duplicated")
    },
    [layouts, showFeedback, currentAccount, currentProject],
  )

  // 레이아웃 삭제
  const handleDeleteLayout = useCallback(
    (layoutId: string) => {
      // 마지막 레이아웃은 삭제 불가
      if (layouts.length <= 1) {
        showFeedback("Cannot delete the only layout")
        return
      }

      console.log(`EditorPage: Deleting layout ${layoutId}`)

      // 애니메이션 효과를 위해 레이아웃 삭제
      setLayouts((prevLayouts) => {
        const updatedLayouts = prevLayouts.filter((layout) => layout.id !== layoutId)
        console.log("EditorPage: Updated layouts after deletion:", updatedLayouts)
        return updatedLayouts
      })

      // 계정 레이아웃 데이터 즉시 저장
      if (currentAccount?.id && currentProject) {
        setAccountLayouts((prev) => {
          const updatedLayouts = prev[currentAccount.id]?.layouts.filter((layout) => layout.id !== layoutId) || []

          const result = {
            ...prev,
            [currentAccount.id]: {
              layouts: updatedLayouts,
              projectId: currentProject.id,
            },
          }

          console.log("EditorPage: Updated account layouts after deletion:", result)
          return result
        })
      }

      // 간결한 피드백 메시지
      showFeedback("Layout deleted")
    },
    [layouts.length, showFeedback, currentAccount, currentProject],
  )

  // 페이지 언마운트 시 데이터 저장
  useEffect(() => {
    // 컴포넌트 마운트/언마운트 감지
    isMountedRef.current = true

    return () => {
      // 진행 중인 모든 작업 취소
      isUpdatingLayoutsRef.current = false
      pendingLayoutUpdateRef.current = null
      accountSwitchingRef.current = false
      isMountedRef.current = false

      // 현재 상태 저장
      if (currentAccount?.id && currentProject && layouts.length > 0) {
        try {
          console.log(`EditorPage: Saving layouts on unmount for account ${currentAccount.id}`)
          const accountLayoutsData = {
            ...JSON.parse(localStorage.getItem("pre-gram-account-layouts") || "{}"),
            [currentAccount.id]: {
              layouts: layouts,
              projectId: currentProject.id,
            },
          }
          localStorage.setItem("pre-gram-account-layouts", JSON.stringify(accountLayoutsData))
        } catch (error) {
          console.error("Error saving layouts on unmount:", error)
        }
      }
    }
  }, [currentAccount, currentProject, layouts])

  // 모바일에서 다음/이전 레이아웃으로 이동하는 함수
  const goToNextLayout = useCallback(() => {
    if (layouts.length > 0) {
      setActiveLayoutIndex((prev) => (prev === layouts.length - 1 ? 0 : prev + 1))
    }
  }, [layouts.length])

  const goToPrevLayout = useCallback(() => {
    if (layouts.length > 0) {
      setActiveLayoutIndex((prev) => (prev === 0 ? layouts.length - 1 : prev - 1))
    }
  }, [layouts.length])

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab)

      // 탭이 "layouts"일 때만 레이아웃 표시
      if (tab === "layouts" && layouts.length === 0) {
        createInitialLayout()
      }

      // 탭이 "settings"일 때는 설정 페이지로 이동
      if (tab === "settings") {
        router.push("/settings/profile")
      }
    },
    [createInitialLayout, layouts.length, router],
  )

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-destructive mb-4">⚠️ {error}</div>
        <Button
          onClick={() => {
            setError(null)
            router.push("/select")
          }}
        >
          돌아가기
        </Button>
      </div>
    )
  }

  if (!currentProject || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center relative border-b">
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-8 hidden md:block">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pregram%20logo-wDnlv8EUftA6IZFH1XLM7ePNSGWTC9.png"
              alt="Pregram Logo"
              fill
              className="object-contain"
            />
          </div>
          <InstagramAccountSelector
            accounts={accounts}
            currentAccount={currentAccount}
            onSelectAccount={handleAccountChange}
          />
        </div>

        {/* 피드백 메시지 - 상단 중앙에 표시 */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute left-1/2 transform -translate-x-1/2 bg-primary/10 text-primary px-4 py-1 rounded-full text-sm"
            >
              {feedbackMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserProfileMenu />
        </div>
      </header>

      <div className={cn("flex-1 p-4 md:p-6", isMobile && "pb-24")}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto w-full h-full"
        >
          {isMobile ? (
            // 모바일 레이아웃
            activeTab === "layouts" ? (
              <div className="flex flex-col h-full">
                {layouts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-muted/10 rounded-lg h-full">
                    <p className="text-muted-foreground mb-4">No layouts found. Create a new layout to get started.</p>
                    <Button onClick={createInitialLayout} className="gap-2">
                      Create New Layout
                    </Button>
                  </div>
                ) : (
                  <div className="relative h-full">
                    {/* 모바일 레이아웃 슬라이더 */}
                    {layouts.length > 1 && activeLayoutIndex > 0 && (
                      <div className="absolute top-1/2 left-2 z-10 transform -translate-y-1/2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={goToPrevLayout}
                          className="rounded-full bg-background/80 backdrop-blur-sm"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                      </div>
                    )}

                    {layouts.length > 1 && activeLayoutIndex < layouts.length - 1 && (
                      <div className="absolute top-1/2 right-2 z-10 transform -translate-y-1/2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={goToNextLayout}
                          className="rounded-full bg-background/80 backdrop-blur-sm"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    )}

                    <div className="h-full">
                      {layouts.map((layout, index) => (
                        <LayoutCard
                          key={layout.id}
                          id={layout.id}
                          index={index}
                          type={type as "feed" | "reels"}
                          images={layout.images}
                          onReorder={(layoutId, reorderedImages) => handleLayoutReorder(layoutId, reorderedImages)}
                          onRemoveImage={(layoutId, imageId) => handleLayoutRemoveImage(layoutId, imageId)}
                          onDuplicate={(layoutId) => handleDuplicateLayout(layoutId)}
                          onDelete={(layoutId) => handleDeleteLayout(layoutId)}
                          onAddImages={(layoutId, images) => handleAddImagesToLayout(layoutId, images)}
                          isMobile={true}
                          isActive={index === activeLayoutIndex}
                        />
                      ))}
                    </div>

                    {/* 페이지 인디케이터 */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                      {layouts.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${index === activeLayoutIndex ? "bg-primary" : "bg-muted"}`}
                          onClick={() => setActiveLayoutIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 다른 탭 컨텐츠
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">{activeTab} 탭</h2>
                  <p className="text-muted-foreground">이 기능은 아직 개발 중입니다.</p>
                </div>
              </div>
            )
          ) : (
            // 데스크톱 레이아웃
            <div className="flex flex-col" ref={carouselRef}>
              {layouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/10 rounded-lg">
                  <p className="text-muted-foreground mb-4">No layouts found. Create a new layout to get started.</p>
                  <Button onClick={createInitialLayout} className="gap-2">
                    Create New Layout
                  </Button>
                </div>
              ) : (
                <FeedCarousel
                  type={type as "feed" | "reels"}
                  layouts={layouts}
                  onReorder={handleLayoutReorder}
                  onRemoveImage={handleLayoutRemoveImage}
                  onDuplicateLayout={handleDuplicateLayout}
                  onDeleteLayout={handleDeleteLayout}
                  onAddImages={handleAddImagesToLayout}
                />
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* 모바일 네비게이션 */}
      {isMobile && <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  )
}
