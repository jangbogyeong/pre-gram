"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FeedGrid from "@/components/feed-grid"
import ReelsGrid from "@/components/reels-grid"
import type { ImageItem } from "@/contexts/project-context"

interface DuplicateLayoutMobileProps {
  type: "feed" | "reels"
  originalImages: ImageItem[]
  duplicateImages: ImageItem[]
  onReorder: (images: ImageItem[]) => void
  onRemoveImage: (id: string) => void
  onReset: () => void
  onApply: () => void
  onCancel: () => void
}

export default function DuplicateLayoutMobile({
  type,
  originalImages,
  duplicateImages,
  onReorder,
  onRemoveImage,
  onReset,
  onApply,
  onCancel,
}: DuplicateLayoutMobileProps) {
  const [activeTab, setActiveTab] = useState<"original" | "duplicate">("original")

  return (
    <div className="lg:hidden w-full">
      <Tabs defaultValue="original" onValueChange={(value) => setActiveTab(value as "original" | "duplicate")}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="original">Original</TabsTrigger>
          <TabsTrigger value="duplicate">Duplicate (Editable)</TabsTrigger>
        </TabsList>

        <TabsContent value="original">
          <div className="bg-white dark:bg-black rounded-lg overflow-hidden shadow-md">
            <div className="p-3 border-b flex items-center">
              <div className="w-7 h-7 rounded-full bg-muted mr-2"></div>
              <span className="text-sm font-medium">your_username</span>
            </div>

            <div className="flex-1 overflow-auto">
              {type === "feed" ? (
                <FeedGrid images={originalImages} onReorder={() => {}} onRemoveImage={() => {}} readOnly={true} />
              ) : (
                <ReelsGrid images={originalImages} onReorder={() => {}} onRemoveImage={() => {}} readOnly={true} />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="duplicate">
          <div className="bg-white dark:bg-black rounded-lg overflow-hidden shadow-md">
            <div className="p-3 border-b flex items-center">
              <div className="w-7 h-7 rounded-full bg-muted mr-2"></div>
              <span className="text-sm font-medium">your_username</span>
            </div>

            <div className="flex-1 overflow-auto">
              {type === "feed" ? (
                <FeedGrid images={duplicateImages} onReorder={onReorder} onRemoveImage={onRemoveImage} />
              ) : (
                <ReelsGrid images={duplicateImages} onReorder={onReorder} onRemoveImage={onRemoveImage} />
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={onReset} variant="outline" className="flex-1">
              Reset
            </Button>
            <Button onClick={onApply} className="flex-1">
              Apply
            </Button>
          </div>

          <Button onClick={onCancel} variant="ghost" className="w-full mt-2">
            Cancel
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
