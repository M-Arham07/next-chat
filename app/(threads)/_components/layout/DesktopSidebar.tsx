import { MessageSquare, Radio, Users, Phone, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export type NavTab = "threads" | "updates" | "communities" | "calls";

interface DesktopSidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const navItems: { id: NavTab; icon: React.ElementType; label: string }[] = [
  { id: "threads", icon: MessageSquare, label: "Threads" },
  { id: "updates", icon: Radio, label: "Updates" },
  { id: "communities", icon: Users, label: "Communities" },
  { id: "calls", icon: Phone, label: "Calls" },
];

const DesktopSidebar = ({ activeTab, onTabChange }: DesktopSidebarProps) => {
  return (
    <motion.div 
      className="w-16 glass-card flex flex-col items-center py-4 border-r border-border/50"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo/Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <Avatar className="w-10 h-10 mb-6 ring-2 ring-border">
          <AvatarFallback className="bg-foreground text-background text-sm font-bold">
            M
          </AvatarFallback>
        </Avatar>
      </motion.div>

      {/* Navigation Icons */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTabChange(item.id)}
                className={`w-11 h-11 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-foreground text-background hover:bg-foreground/90' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    className="absolute -left-2 w-1 h-5 bg-foreground rounded-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <motion.div 
        className="flex flex-col items-center gap-2 mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="w-11 h-11 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl"
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Avatar className="w-9 h-9 ring-1 ring-border">
          <AvatarFallback className="bg-avatar-3 text-foreground text-xs font-medium">
            JD
          </AvatarFallback>
        </Avatar>
      </motion.div>
    </motion.div>
  );
};

export default DesktopSidebar;
