import React from "react";
import { View, Text, Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Button } from "@/components/ui/Button";

export function FloatingActionButton() {
  const router = useRouter();

  return (
    <MotiView
      from={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 300 }}
      className="absolute bottom-6 right-6 z-20"
    >
      <Button
        onPress={() => router.push("/chat/new")}
        className="h-16 w-16 items-center justify-center rounded-2xl bg-foreground shadow-2xl"
      >
        <Plus size={28} color="#000" strokeWidth={2.5} />
      </Button>
    </MotiView>
  );
}
