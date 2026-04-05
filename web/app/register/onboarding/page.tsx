"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";
import OnboardingContent from "./_components/onboarding-content";
import AvatarUpload from "@/components/shared/upload-avatar/avatar.upload";
import UsernameForm from "./_components/username-form";
import { useLoader } from "@/store/loader/use-loader";
import { CreateProfileSchemaResponse } from "@chat/shared";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

// const AVATAR_SIZE_PX = 70;

export default function OnboardingPage() {


    const router = useRouter();

    // use default session image !
    const [displayPicture, setDisplayPicture] = useState<File | null>(null);



    // to reflect image change, in the next auth jwt callback while retrieving user ,attach session.user.image = token.image
    const [username, setUsername] = useState("")
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const { loading, setLoading } = useLoader();

    const MAX_DP_SIZE_MB = 0.5 * 1024 * 1024

    const createProfileMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch("/api/profiles", {
                method: "POST",
                body: formData
            });
            const json = await res.json();
            const { data, success } = CreateProfileSchemaResponse.parse(json);

            if (!res.ok || !success) throw new Error(data || "Failed to create profile");
            return data;
        },
        onMutate: () => setLoading(true),
        onSettled: () => setLoading(false),
        onSuccess: (data) => {
            setSuccessMessage(data);
            router.push("/");
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    // this function will save the onboarded user, and update the session !
    const handleSave = async () => {

        setError("")
        setSuccessMessage("")

        if (displayPicture && displayPicture.size > MAX_DP_SIZE_MB) {
            setError(`Display picture size should be less than ${MAX_DP_SIZE_MB}MB`)
            return;
        }

        if (!username.trim()) {
            setError("Username is required")
            return;
        }

        if (!displayPicture) {
            setError("Please upload a display picture")
            return;
        }

        const formData = new FormData();
        formData.append("username", username);
        formData.append("image", displayPicture);

        createProfileMutation.mutate(formData);
    }






    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    }

    return (
        <main className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 text-foreground flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                    {/* Left Section - Text (Mobile Top, Desktop Left) */}
                    <motion.div variants={itemVariants} className="md:order-1 order-1">
                        <OnboardingContent />
                    </motion.div>

                    {/* Right Section - Avatar & Form (Mobile Middle/Bottom, Desktop Right) */}
                    <motion.div variants={itemVariants} className="md:order-2 order-2 space-y-6 md:space-y-8">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20, y: -10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl backdrop-blur-sm"
                            >
                                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                                <p className="text-sm text-destructive/90 font-medium">{error}</p>
                            </motion.div>
                        )}

                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, x: -20, y: -10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm"
                            >
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-green-700 dark:text-green-300 font-medium">{successMessage}</p>
                            </motion.div>
                        )}

                        {/* Avatar Upload Section */}
                        <motion.div variants={itemVariants}>
                            <AvatarUpload
                                displayPicture={displayPicture}
                                setDisplayPicture={setDisplayPicture}
                                setError={setError}
                                setSuccess={setSuccessMessage}
                            // avatarSize={AVATAR_SIZE_PX}
                            />
                        </motion.div>

                        {/* Username Form Section */}
                        <motion.div variants={itemVariants}>
                            <UsernameForm
                                username={username}
                                setUsername={setUsername}
                                onSave={handleSave}
                                isLoading={loading}
                                displayPictureSet={!!displayPicture}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </main>

    )

}

