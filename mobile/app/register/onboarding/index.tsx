import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle } from "lucide-react-native";
import { CreateProfileSchemaResponse } from "@chat/shared";
import OnboardingContent from "./_components/onboarding-content";
import AvatarUpload from "@/components/shared/upload-avatar/avatar.upload";
import UsernameForm from "./_components/username-form";
import { useLoader } from "@/store/loader/use-loader";
import { Text } from "@/components/ui/text";
import { MotiView } from "moti";
import { apiFetch } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [displayPicture, setDisplayPicture] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { loading, setLoading } = useLoader();
  const MAX_DP_SIZE_MB = 0.5 * 1024 * 1024;

  const createProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiFetch("/api/profiles", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      const { data, success } = CreateProfileSchemaResponse.parse(json);

      if (!res.ok || !success) {

        console.log("res is",res)
        throw new Error(data || "Failed to create profile");}
      return data;
    },
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onSuccess: (data) => {
      setSuccessMessage(data);
      (router.replace as (href: string) => void)("/chat/(threads)");
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");

    if (displayPicture && typeof displayPicture.size === "number" && displayPicture.size > MAX_DP_SIZE_MB) {
      setError(`Display picture size should be less than ${MAX_DP_SIZE_MB}MB`);
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!displayPicture) {
      setError("Please upload a display picture");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("image", displayPicture as unknown as Blob);

    createProfileMutation.mutate(formData);
  };

  return (
    <View className="flex-1 items-center justify-center bg-background px-4 py-8">
      <View className="absolute inset-0">
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ type: "timing", duration: 1000 }}
          className="absolute -left-10 top-0 h-80 w-80 rounded-full bg-primary/5"
        />
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ type: "timing", duration: 1000, delay: 200 }}
          className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-primary/5"
        />
      </View>

      <View className="w-full max-w-xl gap-6">
        <OnboardingContent />

        {error ? (
          <View className="flex-row items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircle size={20} color="#E53E3E" />
            <Text className="flex-1 text-sm text-destructive">{error}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View className="flex-row items-start gap-3 rounded-xl border border-border bg-card p-4">
            <CheckCircle size={20} color="#262626" />
            <Text className="flex-1 text-sm">{successMessage}</Text>
          </View>
        ) : null}

        <AvatarUpload
          displayPicture={displayPicture}
          setDisplayPicture={setDisplayPicture}
          setError={setError}
          setSuccess={setSuccessMessage}
        />

        <UsernameForm
          username={username}
          setUsername={setUsername}
          onSave={handleSave}
          isLoading={loading}
          displayPictureSet={!!displayPicture}
        />
      </View>
    </View>
  );
}
