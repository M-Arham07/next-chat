"use client"

interface TextMessageProps {
  content: string
}

const TextMessage = ({ content }: TextMessageProps) => {
  return (
    <p className="px-4 py-2 text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
      {content}
    </p>
  )
}

export default TextMessage;
