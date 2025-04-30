"use client"

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

export interface ImageItem {
  id: string
  src: string
  file: File
  width: number
  height: number
  isUserUploaded?: boolean // 사용자가 업로드한 이미지인지 여부
}

export interface Project {
  id: string
  name: string
  type: "feed" | "reels"
  images: ImageItem[]
  createdAt: Date
  updatedAt: Date
}

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  createProject: (type: "feed" | "reels", name?: string) => Project
  updateProject: (project: Project) => void
  duplicateProject: (projectId: string) => Project
  addImagesToProject: (projectId: string, newImages: ImageItem[]) => void
  reorderImages: (projectId: string, reorderedImages: ImageItem[]) => void
  removeImage: (projectId: string, imageId: string) => void
  compareProjects: { original: Project | null; duplicate: Project | null }
  setCompareProjects: (original: Project | null, duplicate: Project | null) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [compareProjects, setCompareProjectsState] = useState<{
    original: Project | null
    duplicate: Project | null
  }>({ original: null, duplicate: null })

  // 로컬 스토리지에서 프로젝트 불러오기
  useEffect(() => {
    const storedProjects = localStorage.getItem("pre-gram-projects")
    if (storedProjects) {
      try {
        const parsedProjects = JSON.parse(storedProjects)
        // Date 객체로 변환
        const projectsWithDates = parsedProjects.map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        }))
        setProjects(projectsWithDates)
      } catch (error) {
        console.error("Failed to parse stored projects:", error)
      }
    }
  }, [])

  // 프로젝트 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("pre-gram-projects", JSON.stringify(projects))
    }
  }, [projects])

  // 프로젝트 생성 함수 수정
  const createProject = useCallback(
    (type: "feed" | "reels", name?: string): Project => {
      try {
        const newProject: Project = {
          id: uuidv4(),
          name: name || `${type === "feed" ? "Feed" : "Reels"} Project ${projects.length + 1}`,
          type,
          images: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        setProjects((prev) => [...prev, newProject])
        setCurrentProject(newProject)
        return newProject
      } catch (error) {
        console.error("Error creating project:", error)
        // 에러가 발생해도 최소한의 프로젝트 객체 반환
        return {
          id: uuidv4(),
          name: `Emergency Project`,
          type: type,
          images: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
    },
    [projects.length],
  )

  const updateProject = useCallback(
    (updatedProject: Project) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === updatedProject.id ? { ...updatedProject, updatedAt: new Date() } : project,
        ),
      )

      if (currentProject?.id === updatedProject.id) {
        setCurrentProject({ ...updatedProject, updatedAt: new Date() })
      }
    },
    [currentProject],
  )

  const duplicateProject = useCallback(
    (projectId: string): Project => {
      const projectToDuplicate = projects.find((p) => p.id === projectId)
      if (!projectToDuplicate) throw new Error("Project not found")

      // 이미지 파일은 복제할 수 없으므로 참조만 복사
      const duplicatedProject: Project = {
        ...projectToDuplicate,
        id: uuidv4(),
        name: `${projectToDuplicate.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setProjects((prev) => [...prev, duplicatedProject])
      return duplicatedProject
    },
    [projects],
  )

  // addImagesToProject 함수 수정
  const addImagesToProject = useCallback(
    (projectId: string, newImages: ImageItem[]) => {
      if (!newImages || newImages.length === 0) {
        console.warn("ProjectContext: No images to add to project")
        return
      }

      console.log(`ProjectContext: Adding ${newImages.length} images to project ${projectId}`)

      // 이미지 데이터 검증
      const validImages = newImages.filter((img) => {
        if (!img.id || !img.src || !img.file) {
          console.error("ProjectContext: Invalid image data", img)
          return false
        }
        return true
      })

      if (validImages.length === 0) {
        console.error("ProjectContext: No valid images to add")
        return
      }

      console.log(`ProjectContext: ${validImages.length} valid images to add`)

      try {
        // 프로젝트 목록 업데이트
        setProjects((prevProjects) => {
          // 먼저 대상 프로젝트를 찾습니다
          const targetProject = prevProjects.find((p) => p.id === projectId)
          if (!targetProject) {
            console.error(`ProjectContext: Project with id ${projectId} not found. Creating a new project instead.`)
            // 프로젝트가 없으면 새 프로젝트 생성
            const newProject: Project = {
              id: projectId,
              name: `New Project ${prevProjects.length + 1}`,
              type: "feed",
              images: validImages,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            return [...prevProjects, newProject]
          }

          // 새 이미지를 기존 이미지 배열에 추가
          const updatedImages = [...validImages, ...targetProject.images]
          console.log(`ProjectContext: Project ${projectId} now has ${updatedImages.length} images`)

          // 업데이트된 프로젝트 목록 반환
          return prevProjects.map((project) =>
            project.id === projectId ? { ...project, images: updatedImages, updatedAt: new Date() } : project,
          )
        })

        // 현재 프로젝트가 업데이트 대상이면 현재 프로젝트도 업데이트
        if (currentProject?.id === projectId) {
          setCurrentProject((prevProject) => {
            if (!prevProject) return null

            // 새 이미지를 기존 이미지 배열에 추가
            const updatedImages = [...validImages, ...prevProject.images]
            console.log(`ProjectContext: Current project now has ${updatedImages.length} images`)

            return {
              ...prevProject,
              images: updatedImages,
              updatedAt: new Date(),
            }
          })
        }
      } catch (error) {
        console.error("ProjectContext: Error adding images to project:", error)
      }
    },
    [currentProject],
  )

  const reorderImages = useCallback(
    (projectId: string, reorderedImages: ImageItem[]) => {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              images: reorderedImages,
              updatedAt: new Date(),
            }
          }
          return project
        }),
      )

      if (currentProject?.id === projectId) {
        setCurrentProject((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            images: reorderedImages,
            updatedAt: new Date(),
          }
        })
      }
    },
    [currentProject],
  )

  const removeImage = useCallback(
    (projectId: string, imageId: string) => {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              images: project.images.filter((img) => img.id !== imageId),
              updatedAt: new Date(),
            }
          }
          return project
        }),
      )

      if (currentProject?.id === projectId) {
        setCurrentProject((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            images: prev.images.filter((img) => img.id !== imageId),
            updatedAt: new Date(),
          }
        })
      }
    },
    [currentProject],
  )

  // useCallback으로 함수 메모이제이션
  const setCompareProjects = useCallback((original: Project | null, duplicate: Project | null) => {
    setCompareProjectsState({ original, duplicate })
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        createProject,
        updateProject,
        duplicateProject,
        addImagesToProject,
        reorderImages,
        removeImage,
        compareProjects,
        setCompareProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
