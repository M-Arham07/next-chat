"use client"

import { Download, File } from "lucide-react"

interface DocumentMessageProps {
  documentName: string
  documentUrl: string
}

const DocumentMessage = ({ documentName, documentUrl }: DocumentMessageProps) => {
  const handleDownloadDocument = () => {
    if (documentUrl) {
      const link = document.createElement("a")
      link.href = documentUrl
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
      <button
        onClick={handleDownloadDocument}
        className="p-2 rounded-lg hover:bg-secondary/50 transition-colors shrink-0"
        title="Download document"
      >
        <Download className="w-5 h-5 text-primary" />
      </button>
    </div>
  )
}

export default DocumentMessage
