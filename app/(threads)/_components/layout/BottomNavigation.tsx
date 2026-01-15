import { MessageSquare, Radio, Users, Phone } from "lucide-react";
import { motion } from "framer-motion";

export type NavTab = "threads" | "updates" | "communities" | "calls";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  badge?: number;
  hasDot?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, isActive = false, badge, hasDot = false, onClick }: NavItemProps) => {
  return (
    <motion.button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 px-4 transition-all duration-200 ${
        isActive ? 'text-foreground' : 'text-muted-foreground'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        {isActive ? (
          <motion.div 
            className="px-5 py-1.5 rounded-full bg-foreground text-background flex items-center gap-2"
            layoutId="activeNavPill"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {icon}
            {badge && (
              <span className="text-xs font-semibold">
                {badge}
              </span>
            )}
          </motion.div>
        ) : (
          <div className="relative p-2">
            {icon}
            {hasDot && (
              <motion.div 
                className="absolute top-0.5 right-0.5 w-2 h-2 bg-foreground rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              />
            )}
          </div>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  );
};

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/50 safe-area-inset-bottom bg-accent-foreground"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around py-1">
        <NavItem
          icon={<MessageSquare className="w-5 h-5" />}
          label="Threads"
          isActive={activeTab === "threads"}
          badge={activeTab === "threads" ? 52 : undefined}
          onClick={() => onTabChange("threads")}
        />
        <NavItem
          icon={<Radio className="w-5 h-5" />}
          label="Updates"
          isActive={activeTab === "updates"}
          hasDot={activeTab !== "updates"}
          onClick={() => onTabChange("updates")}
        />
        <NavItem
          icon={<Users className="w-5 h-5" />}
          label="Communities"
          isActive={activeTab === "communities"}
          onClick={() => onTabChange("communities")}
        />
        <NavItem
          icon={<Phone className="w-5 h-5" />}
          label="Calls"
          isActive={activeTab === "calls"}
          onClick={() => onTabChange("calls")}
        />
      </div>
      <div className="h-1 flex justify-center pb-2">
        <div className="w-32 h-1 bg-muted-foreground/30 rounded-full" />
      </div>
    </motion.div>
  );
};

export default BottomNavigation;
