"use client"

import { motion } from "framer-motion"

interface TypingIndicatorProps {
  isSent?: boolean
}

const TypingIndicator = ({ isSent = false }: TypingIndicatorProps) => {
  const dotVariants = {
    initial: { y: 0, opacity: 0.6 },
    animate: { y: -8, opacity: 1 },
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: isSent ? 20 : -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex ${isSent ? "justify-end" : "justify-start"} px-4 py-1`}
    >
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className={`flex items-center gap-1 px-4 py-3 rounded-2xl backdrop-blur-sm border border-glass-border ${
          isSent ? "bg-message-sent rounded-br-md" : "bg-message-received rounded-bl-md"
        }`}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.6,
              delay: index * 0.15,
            }}
            className="w-2 h-2 rounded-full bg-muted-foreground"
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

export default TypingIndicator
