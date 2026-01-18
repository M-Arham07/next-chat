"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface ImageViewerProps {
  imageUrl: string
  isOpen: boolean
  onClose: () => void
}

const ImageViewer = ({ imageUrl, isOpen, onClose }: ImageViewerProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999] bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none"
          >
            <div
              className="relative w-11/12 h-5/6 max-w-4xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Full screen view"
                className="w-full h-full object-contain rounded-xl shadow-2xl"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary/90 hover:bg-secondary transition-colors border border-glass-border shadow-lg"
                title="Close"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default ImageViewer
