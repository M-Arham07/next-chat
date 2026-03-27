import React from "react";
import { View, TouchableOpacity, Modal, Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { Message } from "@chat/shared";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";

interface MessageContextMenuProps {
  message: Message;
  isMe: boolean;
  visible: boolean;
  onReply: () => void;
  onClose: () => void;
}

export default function MessageContextMenu({
  message,
  isMe,
  visible,
  onReply,
  onClose,
}: MessageContextMenuProps) {
  const { handleDeleteMessage } = useChatApp();

  const handleReply = () => { onReply(); onClose(); };

  const handleCopy = async () => {
    if (message.content && message.type === "text") {
      await Clipboard.setStringAsync(message.content);
    }
    onClose();
  };

  const handleDelete = async () => {
    onClose();
    await handleDeleteMessage(message);
  };

  const actions = [
    { label: "↩  Reply", onPress: handleReply, danger: false },
    { label: "⎘  Copy",  onPress: handleCopy,  danger: false },
    ...(isMe ? [{ label: "🗑  Delete", onPress: handleDelete, danger: true }] : []),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/60 items-center justify-center"
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-card border border-border rounded-2xl overflow-hidden w-60">
            {actions.map((action, i) => (
              <React.Fragment key={action.label}>
                {i > 0 && <Separator />}
                <TouchableOpacity
                  onPress={action.onPress}
                  activeOpacity={0.7}
                  className="px-5 py-4 active:bg-accent"
                >
                  <Text
                    className={
                      action.danger
                        ? "text-base font-medium text-destructive"
                        : "text-base font-medium text-foreground"
                    }
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
