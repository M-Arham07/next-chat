"use client"

interface TextMessageProps {
  content: string
}

const TextMessage = ({ content }: TextMessageProps) => {
  return (
    <p
      className={`px-4 py-2 text-sm text-foreground leading-relaxed ${
        content.length > 150 ? "max-w-2xl" : content.length > 80 ? "max-w-xl" : "max-w-md"
      }`}
    >
      {content}
    </p>
  )
}

export default TextMessage
