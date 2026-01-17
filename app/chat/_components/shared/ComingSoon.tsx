import { LucideIcon, Radio, Users, Phone, MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

const tabConfig: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  updates: {
    title: "Updates",
    description: "Status updates and stories from your contacts will appear here.",
    icon: Radio,
  },
  communities: {
    title: "Communities",
    description: "Create and manage communities with multiple groups.",
    icon: Users,
  },
  calls: {
    title: "Calls",
    description: "Your call history and voice/video calls will appear here.",
    icon: Phone,
  },
  default: {
    title: "Select a conversation",
    description: "Choose a chat from the list to start messaging.",
    icon: MessageCircle,
  },
};

const ComingSoon = ({ title, description, icon }: ComingSoonProps) => {
  const config = tabConfig[title?.toLowerCase() || "default"] || tabConfig.default;
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background text-center px-8 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-transparent to-transparent opacity-50" />
      
      {/* Animated rings */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full border border-border/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full border border-border/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
      />
      
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-8 mx-auto glow"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        >
          <Icon className="w-9 h-9 text-foreground" />
        </motion.div>
        
        <motion.h2 
          className="text-2xl font-semibold text-foreground mb-3 tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {displayTitle}
        </motion.h2>
        
        <motion.p 
          className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {displayDescription}
        </motion.p>
        
        <motion.div 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass gradient-border"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <Sparkles className="w-4 h-4 text-foreground" />
          <span className="text-foreground text-sm font-medium">Coming Soon</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
