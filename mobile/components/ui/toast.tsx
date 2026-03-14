import React, { useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";
import { useTheme } from "@/lib/use-theme";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

const toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

export function useToast() {
  const [displayedToasts, setDisplayedToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = onToastChange((newToasts) => {
      setDisplayedToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  const toast = (message: string, variant: ToastVariant = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, variant };
    toasts.push(newToast);
    notifyListeners();

    setTimeout(() => {
      toasts.splice(
        toasts.findIndex((t) => t.id === id),
        1
      );
      notifyListeners();
    }, 3000);
  };

  return { toast, toasts: displayedToasts };
}

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]));
}

function onToastChange(callback: (toasts: Toast[]) => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  const { colors } = useTheme();

  const variantColors: Record<ToastVariant, { bg: string; text: string }> = {
    success: {
      bg: colors.success,
      text: colors.successForeground,
    },
    error: {
      bg: colors.destructive,
      text: colors.destructiveForeground,
    },
    info: {
      bg: colors.primary,
      text: colors.primaryForeground,
    },
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 50,
      }}
    >
      {toasts.map((toast) => (
        <View
          key={toast.id}
          style={{
            backgroundColor: variantColors[toast.variant].bg,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: variantColors[toast.variant].text,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            {toast.message}
          </Text>
        </View>
      ))}
    </View>
  );
}
