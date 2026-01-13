"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X } from "lucide-react"

interface AvatarUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (file: File) => void
  isLoading: boolean
  avatarSize: number // Added avatarSize prop for consistent preview sizing
}

export default function AvatarUploadModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  avatarSize,
}: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfirm = () => {
    if (selectedFile) {
      onConfirm(selectedFile)
      setTimeout(() => {
        setSelectedFile(null)
        setPreview(null)
      }, 500)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreview(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-8 border border-border/50">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold"
                >
                  Upload Picture
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Preview or Upload Area */}
              {preview ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative" style={{ width: avatarSize * 0.8, height: avatarSize * 0.8 }}>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-xl -z-10" />
                      <div className="relative w-full h-full rounded-full overflow-hidden bg-muted border-2 border-border shadow-lg">
                        <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedFile(null)
                        setPreview(null)
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                      className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
                    >
                      Change
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      disabled={isLoading}
                      className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Uploading..." : "Confirm"}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted/20 to-muted/5 hover:from-muted/40 hover:to-muted/20 backdrop-blur-sm overflow-hidden"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent blur-xl -z-10 group-hover:from-primary/10 transition-colors" />

                    <motion.div
                      className="p-3 rounded-full bg-background/50 group-hover:bg-primary/10 transition-colors backdrop-blur-sm border border-border/50"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Upload className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">Click to upload</p>
                      <p className="text-xs text-muted-foreground">or drag and drop</p>
                    </div>
                  </motion.button>
                  <p className="text-xs text-muted-foreground text-center">PNG, JPG, GIF up to 5MB</p>
                </motion.div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
