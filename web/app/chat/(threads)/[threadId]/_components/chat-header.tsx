"use client"

import { ArrowLeft, Phone, MoreVertical, Video } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

interface ChatHeaderProps {
  name: string
  status?: string
  avatarInitial: string
}

const ChatHeader = ({ name, status = "online", avatarInitial }: ChatHeaderProps) => {
  return (
    <header
      className="
        fixed md:absolute top-0 left-0 right-0 z-50
        flex items-center gap-3 px-2 py-3
        backdrop-blur-xl bg-background/80 border-b border-glass-border
        pt-[max(env(safe-area-inset-top),0.75rem)]
      "
    >
      <Link href="/chat">
      <button className="p-2 rounded-full hover:bg-secondary transition-colors">
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>
      </Link>

      <Avatar className="w-10 h-10 bg-linear-to-br from-muted to-accent">
        <AvatarFallback className="bg-transparent text-foreground font-medium">{avatarInitial}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h1 className="text-foreground font-semibold truncate">{name}</h1>
        <p className="text-xs text-muted-foreground">{status}</p>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <Video className="w-5 h-5 text-foreground" />
        </button>
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <Phone className="w-5 h-5 text-foreground" />
        </button>
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <MoreVertical className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </header>
  )
}

export default ChatHeader
