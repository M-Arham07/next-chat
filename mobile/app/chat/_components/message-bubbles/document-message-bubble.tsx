import {
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useUniwind } from 'uniwind';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { FileIcon, DownloadIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

interface DocumentMessageBubbleProps {
  msgId: string;
  documentName: string;
  documentUrl: string;
  status?: string;
  uploadProgress?: number;
}

export function DocumentMessageBubble({
  msgId,
  documentName,
  documentUrl,
  status,
  uploadProgress = 0,
}: DocumentMessageBubbleProps) {
  const { colors } = useUniwind();
  const [isDownloading, setIsDownloading] = useState(false);
  const isUploading = status === 'sending';

  const handleDownloadAndShare = async () => {
    if (isDownloading || isUploading) return;

    try {
      setIsDownloading(true);

      // Download file to cache
      const fileUri = `${FileSystem.cacheDirectory}${documentName}`;
      const downloadResumable = FileSystem.createDownloadResumable(
        documentUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = Math.round(
            (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) *
              100
          );
          // Can track progress here if needed
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result?.uri) {
        // Share the file
        await Sharing.shareAsync(result.uri, {
          mimeType: '*/*',
          dialogTitle: `Share ${documentName}`,
        });
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Extract file extension for styling
  const fileExtension = documentName.split('.').pop()?.toUpperCase() || 'DOC';

  return (
    <View className="flex-row items-center gap-3 px-4 py-3 rounded-lg w-full max-w-xs">
      {/* File Icon */}
      <View
        className="p-2 rounded-lg items-center justify-center shrink-0"
        style={{ backgroundColor: `${colors.primary}20` }}
      >
        <FileIcon className="w-5 h-5" color={colors.primary} />
      </View>

      {/* File Info */}
      <View className="flex-1 min-w-0">
        <Text
          className="text-sm font-medium text-foreground truncate"
          numberOfLines={1}
        >
          {documentName}
        </Text>
        <Text className="text-xs text-muted-foreground">{fileExtension}</Text>
      </View>

      {/* Download/Upload Progress */}
      {isUploading ? (
        <View className="w-10 h-10 items-center justify-center shrink-0">
          <View className="absolute">
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
          <Text className="text-xs font-bold text-foreground">{uploadProgress}%</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleDownloadAndShare}
          disabled={isDownloading}
          className="p-2 rounded-lg items-center justify-center shrink-0"
          style={{
            backgroundColor: isDownloading
              ? `${colors.muted}40`
              : `${colors.primary}20`,
          }}
        >
          {isDownloading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <DownloadIcon className="w-5 h-5" color={colors.primary} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
