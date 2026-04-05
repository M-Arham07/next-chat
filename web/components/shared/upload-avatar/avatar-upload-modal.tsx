"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X } from "lucide-react"

interface AvatarUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (file: File) => void
  avatarSize: number
}

export default function AvatarUploadModal({
  isOpen,
  onClose,
  onConfirm
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Select Profile Picture</h2>
              <button onClick={handleClose} className="p-1 hover:bg-muted rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!preview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
               >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to select an image</p>
              </div>
            ) : (
               <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border border-border">
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2 w-full mt-2">
                    <button onClick={() => { setPreview(null); setSelectedFile(null); }} className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm font-medium">
                      Cancel
                    </button>
                    <button onClick={handleConfirm} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
                      Confirm
                    </button>
                  </div>
               </div>
            )}
            
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

