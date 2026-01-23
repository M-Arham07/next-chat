"use client"

interface TextMessageProps {
  content: string
}

const TextMessage = ({ content }: TextMessageProps) => {
  return (
    <p className="px-4 py-2 text-sm text-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
      {content}
    </p>
  )
}

export default TextMessage;
