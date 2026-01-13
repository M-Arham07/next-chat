"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"
import AvatarUploadModal from "./avatar-upload-modal"

interface AvatarUploadProps {
  displayPicture: string | null
  onUpload: (file: File) => void
  isLoading: boolean
  avatarSize: number // Added avatarSize prop for consistent sizing
}

export default function AvatarUpload({ displayPicture, onUpload, isLoading, avatarSize }: AvatarUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (file: File) => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 200)

    onUpload(file)

    setTimeout(() => {
      setUploadProgress(100)
      setIsModalOpen(false)
      clearInterval(interval)
    }, 1200)
  }

  return (
    <>
      <div className="flex flex-col items-center md:items-start gap-3">
        <label className="text-sm font-medium text-foreground">Display Picture</label>

        {displayPicture ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            whileHover={{ scale: 1.02 }}
            className="relative group cursor-pointer"
            style={{ width: avatarSize, height: avatarSize }}
          >
            {/* Blur background glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-xl -z-10" />

            {/* Main avatar container */}
            <div className="relative w-full h-full rounded-full overflow-hidden bg-muted border-2 border-border shadow-lg backdrop-blur-sm">
              <img
                src={displayPicture || "/placeholder.svg"}
                alt="Display picture preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay on hover */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 transition-opacity"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <Upload className="w-5 h-5 text-white" />
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="relative group rounded-full border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/30 backdrop-blur-sm"
            style={{ width: avatarSize, height: avatarSize }}
          >
            {/* Blur background glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-xl -z-10 group-hover:from-primary/10 transition-colors" />

            <div className="flex flex-col items-center justify-center gap-2">
              <motion.div
                className="p-3 rounded-full bg-background/50 group-hover:bg-primary/10 transition-colors backdrop-blur-sm border border-border/50"
                whileHover={{ scale: 1.1 }}
              >
                <Upload className="w-6 h-6 text-primary" />
              </motion.div>
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground">Add Photo</p>
                <p className="text-xs text-muted-foreground">PNG, JPG (5MB)</p>
              </div>
            </div>
          </motion.button>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-3 mt-4">
            <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden border border-border/50 backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full shadow-lg"
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center font-medium">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </motion.div>
        )}
      </div>

      <AvatarUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFileSelect}
        isLoading={isLoading}
        avatarSize={avatarSize}
      />
    </>
  )
}
