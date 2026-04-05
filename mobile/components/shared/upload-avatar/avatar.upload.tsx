import { SetStateAction, useState, Dispatch, useEffect } from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Upload, RefreshCw } from "lucide-react-native";
import AvatarUploadModal from "./avatar-upload-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { optimizeImage } from "@/lib/optimize-image";

interface AvatarUploadProps {
    displayPicture: File | null;
    avatarSize?: number;
    setError: Dispatch<SetStateAction<string>>;
    setSuccess: Dispatch<SetStateAction<string>>;
    setDisplayPicture: Dispatch<SetStateAction<File | null>>;
}

export default function AvatarUpload({
    displayPicture,
    setDisplayPicture,
    avatarSize = 180,
    setError,
    setSuccess
}: AvatarUploadProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [failedFile, setFailedFile] = useState<File | null>(null);

    useEffect(() => {
        if (displayPicture) {
            setPreviewUrl((displayPicture as unknown as { uri: string }).uri);
        } else {
            setPreviewUrl(null);
        }
    }, [displayPicture]);

    const handleConfirm = async (file: File) => {
        setIsModalOpen(false);
        setIsOptimizing(true);
        setFailedFile(null);
        try {
            const optimizedFile = await optimizeImage(file);
            setDisplayPicture(optimizedFile);
            setSuccess("");
            setError("");
        } catch (error) {
            console.error("Failed to optimize image", error);
            setError("Failed to optimize image.");
            setFailedFile(file);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleRetry = () => {
        if (failedFile) {
            void handleConfirm(failedFile);
        }
    };

    return (
        <View className="items-center gap-4">
            <Text className="text-sm font-medium text-foreground">Profile Picture</Text>

            {previewUrl ? (
                <Pressable
                    className="overflow-hidden rounded-full border-2 border-border"
                    style={{ width: avatarSize, height: avatarSize }}
                    onPress={() => !isOptimizing && setIsModalOpen(true)}
                >
                    <Image source={{ uri: previewUrl }} style={{ width: avatarSize, height: avatarSize }} contentFit="cover" />
                </Pressable>
            ) : (
                <Pressable
                    disabled={isOptimizing}
                    onPress={() => setIsModalOpen(true)}
                    className="items-center justify-center gap-2 rounded-full border-2 border-dashed border-border"
                    style={{ width: avatarSize, height: avatarSize }}
                >
                    <Upload size={28} color="#737373" />
                    <Text className="text-sm text-muted-foreground">{isOptimizing ? "Optimizing..." : "Add Photo"}</Text>
                </Pressable>
            )}

            <View className="flex-row flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onPress={() => setIsModalOpen(true)} disabled={isOptimizing}>
                    <Text>{previewUrl ? "Change Image" : "Select Image"}</Text>
                </Button>

                {failedFile ? (
                    <Button variant="destructive" size="sm" onPress={handleRetry} disabled={isOptimizing} className="flex-row items-center gap-2">
                        <RefreshCw size={16} color="#FFFFFF" />
                        <Text>Retry</Text>
                    </Button>
                ) : null}
            </View>

            <AvatarUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                avatarSize={avatarSize}
            />
        </View>
    );
}
