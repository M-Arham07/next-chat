import { useState } from "react";
import { MoreVertical, Search, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface ThreadHeaderProps {
  isDesktop?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ThreadHeader = ({ isDesktop = false, searchQuery, onSearchChange }: ThreadHeaderProps) => {

  
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <motion.div 
      className="sticky top-0 z-10 glass-card"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <motion.h1 
          className={`font-bold text-foreground tracking-tight ${isDesktop ? 'text-xl' : 'text-2xl'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Threads
        </motion.h1>
        <motion.button 
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <motion.div 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl glass transition-all duration-300 ${
            isSearchFocused ? 'ring-1 ring-foreground/20 glow-sm' : ''
          }`}
          animate={{ 
            scale: isSearchFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent border-none p-0 h-auto text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <AnimatePresence>
            {searchQuery ? (
              <motion.button 
                onClick={() => onSearchChange("")}
                className="p-1 hover:bg-accent rounded-md transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs">AI</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ThreadHeader;