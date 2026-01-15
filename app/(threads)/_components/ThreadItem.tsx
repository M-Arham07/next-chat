import { CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export interface ThreadItemProps {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar?: string;
  initial?: string;
  avatarColor?: string;
  hasBlueCheck?: boolean;
  isGroup?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const avatarColors = [
  "bg-avatar-1",
  "bg-avatar-2", 
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
];

const ThreadItem = ({
  id,
  name,
  lastMessage,
  timestamp,
  avatar,
  initial,
  hasBlueCheck = false,
  isSelected = false,
  onClick,
}: ThreadItemProps) => {
  // Deterministic color based on id
  const colorClass = avatarColors[id % avatarColors.length];

  return (
    <motion.div 
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-accent/50 group ${isSelected ? 'selected bg-accent' : ''}`}
      onClick={onClick}
      whileHover={{ backgroundColor: "hsl(0 0% 12%)" }}
      whileTap={{ scale: 0.970 }}
      transition={{ duration: 0.15 }}
    >
      <Avatar className="w-12 h-12 flex-shrink-0 ring-1 ring-border/50">
        {avatar ? (
          <AvatarImage src={avatar} alt={name} className="object-cover" />
        ) : null}
        <AvatarFallback className={`${colorClass} text-foreground text-base font-medium`}>
          {initial || name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 py-1 border-b border-border/30">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[15px] text-foreground truncate">
            {name}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 font-mono">
            {timestamp}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {hasBlueCheck && (
            <CheckCheck className="w-4 h-4 flex-shrink-0 text-success" color="#09ebd8" />
          )}
          <p className="text-sm text-muted-foreground truncate">
            {lastMessage}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreadItem;