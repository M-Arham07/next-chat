"use client"

import { SetStateAction, useState, Dispatch, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"
import AvatarUploadModal from "./avatar-upload-modal"
import { useLoader } from "@/store/loader/use-loader"
import { GetFileUrl } from "../get-url"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface AvatarUploadProps {
    displayPicture: string | null
    avatarSize?: number // Added avatarSize prop for consistent sizing
    setError: Dispatch<SetStateAction<string>>,
    setSuccess: Dispatch<SetStateAction<string>>
    setDisplayPicture: Dispatch<SetStateAction<string | null>>,
}

export default function AvatarUpload({
    displayPicture,
    setDisplayPicture,
    avatarSize = 180,
    setError,
    setSuccess
}: AvatarUploadProps) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { setLoading, loading } = useLoader();

    const { data: session } = useSession();


    useEffect(() => {


        // if session.user.image doesent exist, or a displayPicture is already selected return!
        if (!session?.user.image || displayPicture) return;

        // otherwise,set the display picture to session.user.image! 
        setDisplayPicture(session.user?.image);

    }, [session, displayPicture]);


    const handleUploadAvatar = async (file: File): Promise<void> => {
        // this function is ONLY responsible to upload the new avatar , and get its url
        // and store it in displayPicute variable ! 
        setLoading(true);
        setIsModalOpen(false);

        const data = await GetFileUrl(file);

        if (!data) {
            setLoading(false);
            setError("Failed to Upload Image!");

            return;
        }


        setDisplayPicture(data.url);

       
        setSuccess("Profile Image Uploaded")


        setLoading(false);

        return;


    }

    // setTimeout(() => {
    //   setUploadProgress(100)
    //   setIsModalOpen(false)
    //   clearInterval(interval)
    // }, 1200)


    return (
        <>
            <div className="flex flex-col items-center md:items-start gap-3">
                <label className="text-sm font-medium text-foreground">Display Picture</label>

                {displayPicture ? (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        whileHover={{ scale: 1.02 }}
                        className="relative group cursor-pointer w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 "
                    // style={{ width: avatarSize, height: avatarSize }}
                    >
                        {/* Blur background glow */}
                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/20 to-primary/5 blur-xl -z-10" />

                        {/* Main avatar container */}
                        <div className="relative w-full h-full rounded-full overflow-hidden bg-muted border-2 border-border shadow-lg backdrop-blur-sm">
                            <img
                                src={displayPicture || "/placeholder.svg"}
                                alt="Display picture preview"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Overlay on hover */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 transition-opacity"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                            >
                                <Upload className="w-5 h-5 text-white" />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsModalOpen(true)}
                        className="relative group rounded-full border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 bg-linear-to-br from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/30 backdrop-blur-sm"
                        style={{ width: avatarSize, height: avatarSize }}
                    >
                        {/* Blur background glow */}
                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/5 to-transparent blur-xl -z-10 group-hover:from-primary/10 transition-colors" />

                        <div className="flex flex-col items-center justify-center gap-2">
                            <motion.div
                                className="p-3 rounded-full bg-background/50 group-hover:bg-primary/10 transition-colors backdrop-blur-sm border border-border/50"
                                whileHover={{ scale: 1.1 }}
                            >
                                <Upload className="w-6 h-6 text-primary" />
                            </motion.div>
                            <div className="text-center">
                                <p className="font-semibold text-sm text-foreground">Add Photo</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG (5MB)</p>
                            </div>
                        </div>
                    </motion.button>
                )}
            </div>

            
                <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 px-3 py-1 dark:hover:bg-primary cursor-pointer"
                >
                    Change Image
                </Button>
            


            <AvatarUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleUploadAvatar}
                isLoading={loading}
                avatarSize={avatarSize}
            />
        </>
    )
}
