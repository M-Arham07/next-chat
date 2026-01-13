"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface UsernameFormProps {
  username: string
  setUsername: (value: string) => void
  onSave: () => void
  isLoading: boolean
  displayPictureSet: boolean
}

export default function UsernameForm({
  username,
  setUsername,
  onSave,
  isLoading,
  displayPictureSet,
}: UsernameFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <label htmlFor="username" className="text-sm font-medium text-foreground">
        Username
      </label>
      <div className="space-y-3">
        <motion.div className="relative group">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={isLoading}
            className="relative w-full px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all disabled:opacity-50 backdrop-blur-sm"
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98, y: 0 }}
          onClick={onSave}
          disabled={isLoading || !displayPictureSet || !username.trim()}
          className="relative w-full px-4 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 blur transition-opacity" />

          <div className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </div>
        </motion.button>
      </div>
    </motion.div>
  )
}
