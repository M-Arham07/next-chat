"use client"

import { Download, File } from "lucide-react"
import { useChatAppStore } from "@/features/chat/store/chatapp.store"
import type { EncryptedMediaMetadata } from "@chat/shared"
import { useDecryptedMedia } from "@/features/chat/hooks/use-decrypted-media"

interface DocumentMessageProps {
  threadId: string
  msgId: string
  documentName: string
  documentUrl: string
  keyVersion?: number | null
  media?: EncryptedMediaMetadata | null
  status?: string
}

const DocumentMessage = ({ threadId, msgId, documentName, documentUrl, keyVersion, media, status }: DocumentMessageProps) => {
  const progress = useChatAppStore(s => s.uploadingProgress?.[msgId] || 0);
  const { objectUrl, loading } = useDecryptedMedia(threadId, keyVersion, media, documentUrl);

  const handleDownloadDocument = () => {
    if (objectUrl) {
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = documentName || "document"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="p-2 rounded-lg bg-secondary/50">
        <File className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{documentName}</p>
      </div>
      {(status === "sending" || loading) ? (
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-muted/20"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={100}
                strokeDashoffset={100 - (100 * progress) / 100}
                className="text-primary transition-all duration-300"
              />
            </svg>
            <span className="text-[9px] font-bold text-foreground">{loading ? "..." : `${progress}%`}</span>
        </div>
      ) : (
        <button
          onClick={handleDownloadDocument}
          className="p-2 rounded-lg hover:bg-secondary/50 transition-colors shrink-0"
          title="Download document"
        >
          <Download className="w-5 h-5 text-primary" />
        </button>
      )}
    </div>
  )
}

export default DocumentMessage
