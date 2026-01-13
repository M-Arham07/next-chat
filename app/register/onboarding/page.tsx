"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";
import OnboardingContent from "./_components/onboarding-content";
import AvatarUpload from "@/components/feedback/avatar/avatar.upload";
import UsernameForm from "./_components/username-form";

const AVATAR_SIZE_PX = 180;

export default function OnboardingPage() {
    
  const [displayPicture, setDisplayPicture] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSave = async () => {
   
    setError("")
    setSuccessMessage("")

    if (!username.trim()) {
      setError("Username is required")
      return
    }

    if (!displayPicture) {
      setError("Please upload a display picture")
      return
    }

    setIsLoading(true)

    try {
    

        await
      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => {
        console.log("Onboarding complete")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {

        setIsLoading(false);
      
    }
  }













    const handleAvatarUpload = async (file: File) => {
    setError("");
    setIsLoading(true);

    

    try {
        await new Promise<void>(r=>setTimeout(()=>r(),1000));
      const reader = new FileReader()
      reader.onload = () => {
        setDisplayPicture(reader.result as string)
        setIsLoading(false)
       
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError("Failed to upload image. Please try again.")
      setIsLoading(false)
    }
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
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
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
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
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
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">{successMessage}</p>
              </motion.div>
            )}

            {/* Avatar Upload Section */}
            <motion.div variants={itemVariants}>
              <AvatarUpload
                displayPicture={displayPicture}
                onUpload={handleAvatarUpload}
                isLoading={isLoading}
                avatarSize={AVATAR_SIZE_PX}
              />
            </motion.div>

            {/* Username Form Section */}
            <motion.div variants={itemVariants}>
              <UsernameForm
                username={username}
                setUsername={setUsername}
                onSave={handleSave}
                isLoading={isLoading}
                displayPictureSet={!!displayPicture}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </main>
    
  )

}

