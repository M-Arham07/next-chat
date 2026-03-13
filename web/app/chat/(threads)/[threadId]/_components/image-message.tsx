"use client"

import { useState } from "react";
import ImageViewer from "./image-viewer";
import Image from "next/image";

interface ImageMessageProps {
  imageUrl: string
  status?: string
}

const ImageMessage = ({ imageUrl, status }: ImageMessageProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

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
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
        )}
      </div>
      <ImageViewer imageUrl={imageUrl || ""} isOpen={isImageViewerOpen} onClose={() => setIsImageViewerOpen(false)} />
    </>
  )
}

export default ImageMessage
