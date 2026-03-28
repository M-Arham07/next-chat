import React, { createContext, useContext, ReactNode } from "react";
import { useChatApp } from "../hooks/use-chat-app";

type ChatAppContextType = ReturnType<typeof useChatApp>;

const ChatAppContext = createContext<ChatAppContextType | null>(null);

interface ChatAppProviderProps {
  children: ReactNode;
}

export function ChatAppProvider({ children }: ChatAppProviderProps) {
  const chatApp = useChatApp();

  return (
    <ChatAppContext.Provider value={chatApp}>
      {children}
    </ChatAppContext.Provider>
  );
}

export function useChatAppContext() {
  const context = useContext(ChatAppContext);
  if (!context) {
    throw new Error("useChatAppContext must be used within a ChatAppProvider");
  }
  return context;
}
