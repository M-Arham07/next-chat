import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveFilter } from "@/features/chat/types";
import { motion } from "framer-motion";

interface ThreadFilterTabsProps {
  activeFilter: string;
  onFilterChange: (value: ActiveFilter) => void;
}

const filters = ["all", "unread", "groups"] as const;

const ThreadFilterTabs = ({ activeFilter, onFilterChange }: ThreadFilterTabsProps) => {
  return (
    <motion.div
      className="px-4 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
    >
      <Tabs value={activeFilter} onValueChange={onFilterChange}>
        <TabsList
          className="
            inline-flex h-auto w-full sm:w-auto items-center gap-1.5 p-1
            rounded-full border border-border/60 bg-background/60 backdrop-blur
            shadow-sm
          "
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <TabsTrigger
                key={filter}
                value={filter}
                className="
                  relative rounded-full px-4 py-2 text-sm font-medium capitalize
                  bg-transparent shadow-none
                  transition-[color,transform] duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  ring-offset-background
                  data-[state=inactive]:text-muted-foreground
                  data-[state=inactive]:hover:text-foreground
                  active:scale-[0.98]
                "
              >
                {/* floating active pill */}
                {isActive && (
                  <motion.span
                    layoutId="thread-filter-active-pill"
                    className="
                      absolute inset-0 rounded-full
                      bg-accent/80 dark:bg-accent/60
                      border border-border/60
                      shadow-sm
                    "
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}

                {/* label */}
                <span
                  className={[
                    "relative z-10",
                    isActive ? "text-foreground" : "text-inherit",
                  ].join(" ")}
                >
                  {filter}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </motion.div>
  );
};

export default ThreadFilterTabs;
