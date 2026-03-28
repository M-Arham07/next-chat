import { View, Text, Pressable } from "react-native";
import { FileText, Download } from "lucide-react-native";
import * as Linking from "expo-linking";
import { useThemeColors } from "@/hooks/useThemeColors";

interface DocumentMessageProps {
  documentName: string;
  documentUrl: string;
}

export function DocumentMessage({ documentName, documentUrl }: DocumentMessageProps) {
  const colors = useThemeColors();

  const handleOpen = async () => {
    try {
      await Linking.openURL(documentUrl);
    } catch (error) {
      console.log("Error opening document:", error);
    }
  };

  // Get file extension for display
  const getFileExtension = (url: string) => {
    const parts = url.split(".");
    return parts[parts.length - 1]?.toUpperCase() || "FILE";
  };

  return (
    <Pressable
      onPress={handleOpen}
      className="flex-row items-center p-3 gap-3 min-w-[200px]"
    >
      {/* File Icon */}
      <View
        className="w-12 h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: colors.primary + "20" }}
      >
        <FileText size={24} color={colors.primary} />
      </View>

      {/* File Info */}
      <View className="flex-1">
        <Text
          className="text-sm font-medium"
          numberOfLines={1}
          style={{ color: colors.foreground }}
        >
          {documentName}
        </Text>
        <Text
          className="text-xs"
          style={{ color: colors.mutedForeground }}
        >
          {getFileExtension(documentUrl)} Document
        </Text>
      </View>

      {/* Download Icon */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.secondary }}
      >
        <Download size={16} color={colors.foreground} />
      </View>
    </Pressable>
  );
}
