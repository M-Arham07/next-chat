"use client"

import { useState } from "react";
import ImageViewer from "./image-viewer";
import Image from "next/image";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";

interface ImageMessageProps {
  msgId: string
  imageUrl: string
  status?: string
}

const ImageMessage = ({ msgId, imageUrl, status }: ImageMessageProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const progress = useChatAppStore(s => s.uploadingProgress?.[msgId] || 0);

  return (
    <>
      <div className="p-1 relative">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt="Message"
          onClick={() => {
            if (status !== "sending") setIsImageViewerOpen(true)
          }}
          width={500}
          height={500}
          loading="lazy"
          className={`rounded-xl max-w-62.5 sm:max-w-75 object-cover transition-opacity ${status === "sending" ? "opacity-40 grayscale-[0.5] cursor-not-allowed" : "cursor-pointer hover:opacity-90"}`}
        />
        {status === "sending" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
             <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-white/20"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * progress) / 100}
                    className="text-primary transition-all duration-300"
                  />
                </svg>
                <span className="text-[10px] font-bold text-white">{progress}%</span>
             </div>
          </div>
        )}
      </div>
      <ImageViewer imageUrl={imageUrl || ""} isOpen={isImageViewerOpen} onClose={() => setIsImageViewerOpen(false)} />
    </>
  )
}

export default ImageMessage
