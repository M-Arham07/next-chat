import React from "react";
import { View, Text, Pressable } from "react-native";
import * as Linking from "expo-linking";
import { Download, FileText } from "lucide-react-native";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";

export function DocumentMessage({ msgId, documentName, documentUrl, status }: any) {
  const progress = useChatAppStore((s) => s.uploadingProgress?.[msgId] || 0);

  const handleDownload = async () => {
    if (documentUrl && status !== "sending") {
      await Linking.openURL(documentUrl);
    }
  };

  return (
    <View className="flex-row items-center gap-3 px-4 py-3 bg-secondary/20 rounded-xl">
      <View className="p-2 rounded-lg bg-secondary/50">
        <FileText size={20} color="#f5f5f5" />
      </View>
      <View className="flex-1 pr-2">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {documentName}
        </Text>
      </View>
      {status === "sending" ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary/50">
          <Text className="text-[9px] font-bold text-foreground">{progress}%</Text>
        </View>
      ) : (
        <Pressable
          onPress={handleDownload}
          className="p-2 rounded-lg bg-secondary/40 active:bg-secondary/60"
        >
          <Download size={20} color="#f5f5f5" />
        </Pressable>
      )}
    </View>
  );
}
