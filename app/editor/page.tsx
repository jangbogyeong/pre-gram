"use client"

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProject } from "@/contexts/project-context"
import { useAuth } from "@/contexts/auth-context"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"
import { v4 as uuidv4 } from "uuid"
import type { ImageItem } from "@/contexts/project-context"
import FeedCarousel from "@/components/feed-carousel"
import { useToast } from "@/hooks/use-toast"
import UserProfileMenu from "@/components/user-profile-menu"
import InstagramAccountSelector from "@/components/instagram-account-selector"
import { generateDummyFeedImages, dummyInstagramAccounts } from "@/utils/dummy-data"
import { Suspense } from "react"

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

// 로딩 컴포넌트
const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
})

// 헤더 컴포넌트
const EditorHeader = memo(function EditorHeader({
  currentAccount,
  accounts,
  onAccountChange,
}: {
  currentAccount: any
  accounts: any[]
  onAccountChange: (account: any) => void
}) {
  return (
    <header className="p-4 flex justify-between items-center relative border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold hidden md:block">Pre-gram</h1>
        <InstagramAccountSelector
          accounts={accounts}
          currentAccount={currentAccount}
          onSelectAccount={onAccountChange}
        />
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <UserProfileMenu />
      </div>
    </header>
  )
})

// 메인 에디터 컴포넌트
function EditorContent({
  type,
  layouts,
  onReorder,
  onRemoveImage,
  onDuplicateLayout,
  onDeleteLayout,
  onAddImages,
}: {
  type: string
  layouts: Layout[]
  onReorder: (layoutId: string, reorderedImages: ImageItem[]) => void
  onRemoveImage: (layoutId: string, imageId: string) => void
  onDuplicateLayout: (layoutId: string) => void
  onDeleteLayout: (layoutId: string) => void
  onAddImages: (layoutId: string, images: ImageItem[]) => void
}) {
  const carouselRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex-1 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto w-full"
      >
        <div className="flex flex-col" ref={carouselRef}>
          <FeedCarousel
            type={type as "feed" | "reels"}
            layouts={layouts}
            onReorder={onReorder}
            onRemoveImage={onRemoveImage}
            onDuplicateLayout={onDuplicateLayout}
            onDeleteLayout={onDeleteLayout}
            onAddImages={onAddImages}
          />
        </div>
      </motion.div>
    </div>
  )
}

// 메인 페이지 컴포넌트
export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { projects, currentProject, setCurrentProject, addImagesToProject, reorderImages, removeImage, createProject } =
    useProject()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const projectInitializedRef = useRef(false)
  const layoutsInitializedRef = useRef(false)
  const accountSwitchingRef = useRef(false)
  const isUpdatingLayoutsRef = useRef(false)
  const pendingLayoutUpdateRef = useRef<Layout[] | null>(null)
  const dataLoadedRef = useRef(false)
  const dummyImagesAddedRef = useRef(false)
  const redirectInProgressRef = useRef(false)
  const isProcessingRef = useRef(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const projectId = searchParams.get("id")
  const type = "feed"

  // 상태 정의
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [accountLayouts, setAccountLayouts] = useState<AccountLayouts>({})
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState(dummyInstagramAccounts)
  const [currentAccount, setCurrentAccount] = useState(dummyInstagramAccounts[0])

  // 프로젝트 ID가 없거나 유효하지 않을 때 새 프로젝트 생성 및 리다이렉트
  const createAndRedirect = useCallback(() => {
    try {
      if (redirectInProgressRef.current) return
      redirectInProgressRef.current = true

      const newProject = createProject("feed") // 항상 feed 타입으로 고정
      router.replace(`/editor?type=feed&id=${newProject.id}`)
    } catch (error) {
      console.error("EditorPage: Error creating new project:", error)
      setIsLoading(false)
      redirectInProgressRef.current = false
    }
  }, [createProject, router])

  // 프로젝트 ID가 없거나 유효하지 않을 때 새 프로젝트 생성 및 리다이렉트
  useEffect(() => {
    // 이미 리다이렉트 중이거나 프로젝트가 초기화된 경우 실행하지 않음
    if (redirectInProgressRef.current || projectInitializedRef.current) return

    // 프로젝트 ID가 없는 경우에만 새 프로젝트 생성
    if (!projectId) {
      createAndRedirect()
    }
    // 프로젝트 ID가 있지만 유효하지 않은 경우
    else if (projects.length > 0 && !projects.some((p) => p.id === projectId)) {
      createAndRedirect()
    }
  }, [projectId, projects, createAndRedirect])

  // 레이아웃 업데이트 함수 - 최적화
  const safelyUpdateLayouts = useCallback(
    (newLayouts: Layout[]) => {
      if (isUpdatingLayoutsRef.current) {
        pendingLayoutUpdateRef.current = newLayouts
        return
      }

      isUpdatingLayoutsRef.current = true

      // Deep comparison to prevent unnecessary updates
      const currentLayoutsJson = JSON.stringify(
        layouts.map((l) => ({ id: l.id, imageIds: l.images.map((img) => img.id) })),
      )
      const newLayoutsJson = JSON.stringify(
        newLayouts.map((l) => ({ id: l.id, imageIds: l.images.map((img) => img.id) })),
      )

      const layoutsChanged = currentLayoutsJson !== newLayoutsJson

      if (layoutsChanged) {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          setLayouts(newLayouts)

          // Reset flag after a short delay
          setTimeout(() => {
            isUpdatingLayoutsRef.current = false

            if (pendingLayoutUpdateRef.current) {
              const pendingUpdate = pendingLayoutUpdateRef.current
              pendingLayoutUpdateRef.current = null
              safelyUpdateLayouts(pendingUpdate)
            }
          }, 50)
        })
      } else {
        isUpdatingLayoutsRef.current = false
        if (pendingLayoutUpdateRef.current) {
          const pendingUpdate = pendingLayoutUpdateRef.current
          pendingLayoutUpdateRef.current = null
          safelyUpdateLayouts(pendingUpdate)
        }
      }
    },
    [layouts],
  )

  // 더미 이미지 추가 함수
  const addDummyImagesToProject = useCallback(() => {
    if (!currentProject || dummyImagesAddedRef.current) return

    // 더미 이미지 생성
    const dummyImages = generateDummyFeedImages(9)

    // 프로젝트에 더미 이미지 추가
    addImagesToProject(currentProject.id, dummyImages)

    // 더미 이미지 추가 완료 표시
    dummyImagesAddedRef.current = true

    return dummyImages
  }, [currentProject, addImagesToProject])

  // 초기 레이아웃 생성 함수
  const createInitialLayout = useCallback(() => {
    if (!currentProject) return

    // 더미 이미지 추가
    const dummyImages = addDummyImagesToProject() || []

    // 프로젝트에 이미지가 있는지 확인
    if (currentProject.images.length > 0 || dummyImages.length > 0) {
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
        setAccountLayouts((prev) => ({
          ...prev,
          [currentAccount.id]: {
            layouts: [initialLayout],
            projectId: currentProject.id,
          },
        }))
      }
    } else {
      // 프로젝트에 이미지가 없는 경우 빈 레이아웃 생성
      const emptyLayout = {
        id: uuidv4(),
        images: [],
      }
      safelyUpdateLayouts([emptyLayout])
      layoutsInitializedRef.current = true

      // 계정 레이아웃 데이터 저장
      if (currentAccount?.id && currentProject) {
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

  // 로컬 스토리지에서 계정별 레이아웃 데이터 불러오기 - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    if (dataLoadedRef.current) return

    const loadAccountLayouts = () => {
      setIsLoading(true)

      try {
        const storedAccountLayouts = localStorage.getItem("pre-gram-account-layouts")
        if (storedAccountLayouts) {
          const parsedAccountLayouts = JSON.parse(storedAccountLayouts)
          setAccountLayouts(parsedAccountLayouts)
        }
      } catch (error) {
        console.error("EditorPage: Failed to parse stored account layouts:", error)
      }

      dataLoadedRef.current = true
      setIsLoading(false)
    }

    // 비동기적으로 데이터 로드
    const timer = setTimeout(loadAccountLayouts, 0)
    return () => clearTimeout(timer)
  }, [])

  // 계정별 레이아웃 데이터 저장 - 디바운스 처리
  useEffect(() => {
    if (Object.keys(accountLayouts).length > 0 && dataLoadedRef.current) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem("pre-gram-account-layouts", JSON.stringify(accountLayouts))
        } catch (error) {
          console.error("EditorPage: Failed to save account layouts:", error)
        }
        debounceTimerRef.current = null
      }, 1000)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [accountLayouts])

  // 프로젝트 초기화 - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    if (projectId && !projectInitializedRef.current && !redirectInProgressRef.current) {
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        setCurrentProject(project)
        projectInitializedRef.current = true
        setIsLoading(false)
      } else if (projects.length > 0) {
        // 프로젝트 목록이 로드되었지만 해당 ID의 프로젝트가 없는 경우
        createAndRedirect()
      } else {
        // 프로젝트 목록이 아직 로드되지 않은 경우
        setIsLoading(true)
      }
    }
  }, [projectId, projects, setCurrentProject, createAndRedirect])

  // 현재 계정이 변경될 때 해당 계정의 레이아웃 불러오기
  useEffect(() => {
    if (
      !currentAccount?.id ||
      !projectInitializedRef.current ||
      accountSwitchingRef.current ||
      !dataLoadedRef.current ||
      redirectInProgressRef.current
    ) {
      return
    }

    setIsLoading(true)

    // 비동기 처리를 위한 setTimeout 사용
    const timer = setTimeout(() => {
      try {
        // 현재 계정의 레이아웃 데이터가 있는지 확인
        const accountData = accountLayouts[currentAccount.id]

        if (accountData) {
          // 해당 계정의 프로젝트 ID와 레이아웃 불러오기
          const storedProjectId = accountData.projectId
          const storedLayouts = accountData.layouts

          // 프로젝트 ID가 변경되었으면 URL 업데이트
          if (projectId !== storedProjectId) {
            redirectInProgressRef.current = true
            router.replace(`/editor?type=feed&id=${storedProjectId}`)
            return // 라우터 변경 후 추가 로직 실행 방지
          }

          // 프로젝트 설정
          const project = projects.find((p) => p.id === storedProjectId)
          if (project) {
            setCurrentProject(project)
          }

          // 레이아웃 설정 - 비동기 처리
          if (storedLayouts && storedLayouts.length > 0) {
            // 깊은 복사를 통해 새 객체 생성
            const newLayouts = JSON.parse(JSON.stringify(storedLayouts))

            // 현재 레이아웃과 비교하여 변경된 경우에만 업데이트
            const currentLayoutsJson = JSON.stringify(
              layouts.map((l) => ({ id: l.id, imageIds: l.images.map((img) => img.id) })),
            )
            const newLayoutsJson = JSON.stringify(
              newLayouts.map((l) => ({ id: l.id, imageIds: l.images.map((img) => img.id) })),
            )

            if (currentLayoutsJson !== newLayoutsJson) {
              safelyUpdateLayouts(newLayouts)
            }
            layoutsInitializedRef.current = true
          } else {
            // 레이아웃이 없으면 초기 레이아웃 생성
            createInitialLayout()
          }
        } else if (currentProject) {
          // 계정 데이터가 없으면 현재 프로젝트로 초기 레이아웃 생성
          createInitialLayout()
        }
      } catch (error) {
        console.error("EditorPage: Error loading layouts:", error)
      } finally {
        setIsLoading(false)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [
    currentAccount,
    projectId,
    currentProject,
    projects,
    setCurrentProject,
    router,
    accountLayouts,
    safelyUpdateLayouts,
    createInitialLayout,
    layouts,
  ])

  // 레이아웃 변경 시 계정 레이아웃 데이터 저장 - 디바운스 처리
  useEffect(() => {
    if (
      !currentAccount?.id ||
      !layoutsInitializedRef.current ||
      !currentProject ||
      accountSwitchingRef.current ||
      !dataLoadedRef.current
    )
      return

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setAccountLayouts((prev) => {
        const updatedAccountLayouts = {
          ...prev,
          [currentAccount.id]: {
            layouts: layouts,
            projectId: currentProject.id,
          },
        }
        return updatedAccountLayouts
      })
      debounceTimerRef.current = null
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [layouts, currentAccount, currentProject])

  // 인스타그램 계정 변경 핸들러
  const handleAccountChange = useCallback(
    (account: any) => {
      // Prevent rapid switching
      if (isProcessingRef.current || accountSwitchingRef.current) return
      if (currentAccount.id === account.id) return

      accountSwitchingRef.current = true
      setIsLoading(true)

      // Save current account data
      if (currentAccount?.id && currentProject) {
        setAccountLayouts((prev) => ({
          ...prev,
          [currentAccount.id]: {
            layouts: [...layouts],
            projectId: currentProject.id,
          },
        }))
      }

      // Debounce account switching to prevent flickering
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        setCurrentAccount(account)
        layoutsInitializedRef.current = false
        dummyImagesAddedRef.current = false

        // Reset flags after transition completes
        setTimeout(() => {
          accountSwitchingRef.current = false
          setIsLoading(false)
        }, 200)

        debounceTimerRef.current = null
      }, 300)
    },
    [currentAccount, currentProject, layouts],
  )

  // 특정 레이아웃에만 이미지 추가
  const handleAddImagesToLayout = useCallback(
    (layoutId: string, newImages: ImageItem[]) => {
      if (!newImages || newImages.length === 0) return

      // 이미지 데이터 검증
      const validImages = newImages.filter((img) => {
        if (!img.id || !img.src || !img.file) return false
        return true
      })

      if (validImages.length === 0) return

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
              const updatedImages = [...validImages, ...userUploadedImages, ...existingFeedImages]
              return {
                ...layout,
                images: updatedImages,
              }
            }
            return layout
          })

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

            return result
          })
        }
      }
    },
    [addImagesToProject, currentProject, currentAccount, layouts],
  )

  // 레이아웃 이미지 재정렬
  const handleLayoutReorder = useCallback(
    (layoutId: string, reorderedImages: ImageItem[]) => {
      // Prevent multiple simultaneous updates
      if (isUpdatingLayoutsRef.current) {
        return
      }

      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setLayouts((prevLayouts) => {
          // Only update if the layout exists and images have changed
          const layoutIndex = prevLayouts.findIndex((layout) => layout.id === layoutId)
          if (layoutIndex === -1) return prevLayouts

          const currentLayout = prevLayouts[layoutIndex]

          // Deep comparison to prevent unnecessary updates
          const currentImagesJson = JSON.stringify(currentLayout.images.map((img) => img.id))
          const reorderedImagesJson = JSON.stringify(reorderedImages.map((img) => img.id))

          if (currentImagesJson === reorderedImagesJson) return prevLayouts

          // Create a new array with only the changed layout updated
          const updatedLayouts = [...prevLayouts]
          updatedLayouts[layoutIndex] = { ...currentLayout, images: [...reorderedImages] }
          return updatedLayouts
        })

        // Delay project update to prevent UI jank
        if (currentProject) {
          setTimeout(() => {
            reorderImages(currentProject.id, reorderedImages)
          }, 50)
        }
      })
    },
    [currentProject, reorderImages],
  )

  // 레이아웃에서 이미지 제거
  const handleLayoutRemoveImage = useCallback(
    (layoutId: string, imageId: string) => {
      const layout = layouts.find((l) => l.id === layoutId)
      if (!layout) {
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
              return { ...layout, images: filteredImages }
            }
            return layout
          })

          return updatedLayouts
        })

        // 현재 프로젝트에서도 이미지 제거
        if (currentProject) {
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

            return result
          })
        }
      }
    },
    [currentProject, layouts, removeImage, currentAccount],
  )

  // 레이아웃 복제
  const handleDuplicateLayout = useCallback(
    (layoutId: string) => {
      const layoutToDuplicate = layouts.find((l) => l.id === layoutId)
      if (!layoutToDuplicate) {
        return
      }

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

      // 애니메이션 효과를 위해 새 레이아웃 추가
      setLayouts((prevLayouts) => {
        const updatedLayouts = [...prevLayouts, duplicatedLayout]
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
    },
    [layouts, currentAccount, currentProject],
  )

  // 레이아웃 삭제
  const handleDeleteLayout = useCallback(
    (layoutId: string) => {
      // 마지막 레이아웃은 삭제 불가
      if (layouts.length <= 1) {
        return
      }

      // 애니메이션 효과를 위해 레이아웃 삭제
      setLayouts((prevLayouts) => {
        const updatedLayouts = prevLayouts.filter((layout) => layout.id !== layoutId)
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

          return result
        })
      }
    },
    [layouts.length, currentAccount, currentProject],
  )

  // 컴포넌트 마운트 시 더미 이미지 추가
  useEffect(() => {
    if (currentProject && !dummyImagesAddedRef.current && projectInitializedRef.current) {
      addDummyImagesToProject()
    }
  }, [currentProject, addDummyImagesToProject, projectInitializedRef])

  // 리다이렉트 완료 후 플래그 리셋
  useEffect(() => {
    if (redirectInProgressRef.current && projectId) {
      // 약간의 지연 후 리다이렉트 플래그 리셋
      const timer = setTimeout(() => {
        redirectInProgressRef.current = false
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [projectId])

  // 메모이제이션된 레이아웃 - 불필요한 리렌더링 방지
  const memoizedLayouts = useMemo(() => {
    return layouts.length > 0 ? layouts : [{ id: uuidv4(), images: currentProject?.images || [] }]
  }, [layouts, currentProject])

  // If authentication is still loading, show a loading indicator
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no user is authenticated and we're not in development mode, redirect to login
  if (!user && process.env.NODE_ENV !== "development") {
    router.push("/login")
    return null
  }

  if (!currentProject || isLoading) {
    return <LoadingIndicator />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <EditorHeader currentAccount={currentAccount} accounts={accounts} onAccountChange={handleAccountChange} />

      <Suspense fallback={<LoadingIndicator />}>
        <EditorContent
          type="feed"
          layouts={memoizedLayouts}
          onReorder={handleLayoutReorder}
          onRemoveImage={handleLayoutRemoveImage}
          onDuplicateLayout={handleDuplicateLayout}
          onDeleteLayout={handleDeleteLayout}
          onAddImages={handleAddImagesToLayout}
        />
      </Suspense>
    </div>
  )
}
