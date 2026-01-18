"use client"

import { motion } from "framer-motion"

interface DateSeparatorProps {
  date: string
}

const DateSeparator = ({ date }: DateSeparatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex justify-center py-4"
    >
      <span className="px-4 py-1.5 text-xs text-muted-foreground bg-secondary/60 backdrop-blur-sm rounded-full border border-glass-border">
        {date}
      </span>
    </motion.div>
  )
}

export default DateSeparator
