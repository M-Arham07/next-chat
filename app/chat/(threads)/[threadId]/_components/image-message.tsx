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
          className="rounded-xl max-w-[250px] sm:max-w-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
        />
      </div>
      <ImageViewer imageUrl={imageUrl || ""} isOpen={isImageViewerOpen} onClose={() => setIsImageViewerOpen(false)} />
    </>
  )
}

export default ImageMessage
