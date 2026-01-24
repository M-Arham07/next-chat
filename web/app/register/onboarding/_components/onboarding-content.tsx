"use client"

import { motion } from "framer-motion"

export default function OnboardingContent() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6 md:space-y-8 px-4 md:px-0 text-center md:text-left"
    >
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance leading-tight">Create Your Username</h1>
      <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-balance max-w-lg mx-auto md:mx-0">
        Personalize your profile and set up your account. Choose a unique username and upload a profile picture to get
        started on your journey.
      </p>
    </motion.div>
  )
}
