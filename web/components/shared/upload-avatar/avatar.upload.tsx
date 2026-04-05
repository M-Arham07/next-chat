"use client"

import { SetStateAction, useState, Dispatch, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, Loader2, RefreshCw } from "lucide-react"
import AvatarUploadModal from "./avatar-upload-modal"
import { Button } from "@/components/ui/button"
import { optimizeImage } from "@/lib/optimize-image"

interface AvatarUploadProps {
    displayPicture: File | null
    avatarSize?: number
    setError: Dispatch<SetStateAction<string>>
    setSuccess: Dispatch<SetStateAction<string>>
    setDisplayPicture: Dispatch<SetStateAction<File | null>>
}

export default function AvatarUpload({
    displayPicture,
    setDisplayPicture,
    avatarSize = 180,
    setError,
    setSuccess
}: AvatarUploadProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [failedFile, setFailedFile] = useState<File | null>(null)

    useEffect(() => {
        if (displayPicture) {
            const url = URL.createObjectURL(displayPicture)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setPreviewUrl(null)
        }
    }, [displayPicture])

    const handleConfirm = async (file: File) => {
        setIsModalOpen(false)
        setIsOptimizing(true)
        setFailedFile(null)
        try {
            const optimizedFile = await optimizeImage(file)
            setDisplayPicture(optimizedFile)
            setError("") // clear any previous errors
        } catch (error) {
            console.error("Failed to optimize image", error)
            setError("Failed to optimize image.")
            setFailedFile(file)
        } finally {
            setIsOptimizing(false)
        }
    }

    const handleRetry = () => {
        if (failedFile) {
            handleConfirm(failedFile)
        }
    }

    return (
        <div className="flex flex-col items-center md:items-start gap-4">
            <label className="text-sm font-medium text-foreground">Profile Picture</label>

            {previewUrl ? (
                <div
                    className="relative group cursor-pointer rounded-full overflow-hidden border-2 border-border"
                    style={{ width: avatarSize, height: avatarSize }}
                    onClick={() => !isOptimizing && setIsModalOpen(true)}
                >
                    <img
                        src={previewUrl}
                        alt="Profile preview"
                        className={`w-full h-full object-cover transition-all ${isOptimizing ? 'opacity-50 blur-sm' : ''}`}
                    />
                    {isOptimizing ? (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin mb-1" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    disabled={isOptimizing}
                    onClick={() => setIsModalOpen(true)}
                    className="relative flex flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-border hover:bg-muted/50 transition-colors overflow-hidden"
                    style={{ width: avatarSize, height: avatarSize }}
                >
                    {isOptimizing ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <span className="text-xs font-medium">Optimizing...</span>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Add Photo</span>
                        </>
                    )}
                </button>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    type="button"
                    disabled={isOptimizing}
                >
                    {previewUrl ? "Change Image" : "Select Image"}
                </Button>

                {failedFile && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRetry}
                        type="button"
                        disabled={isOptimizing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </Button>
                )}
            </div>

            <AvatarUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                avatarSize={avatarSize}
            />
        </div>
    )
}
