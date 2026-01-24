"use client"

import { useState } from "react"
import ImageViewer from "./image-viewer"

interface ImageMessageProps {
  imageUrl: string
}

const ImageMessage = ({ imageUrl }: ImageMessageProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

  return (
    <>
      <div className="p-1">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Message"
          onClick={() => setIsImageViewerOpen(true)}
          className="rounded-xl max-w-62.5 sm:max-w-75 object-cover cursor-pointer hover:opacity-90 transition-opacity"
        />
      </div>
      <ImageViewer imageUrl={imageUrl || ""} isOpen={isImageViewerOpen} onClose={() => setIsImageViewerOpen(false)} />
    </>
  )
}

export default ImageMessage
