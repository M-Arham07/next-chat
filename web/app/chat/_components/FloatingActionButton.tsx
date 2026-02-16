import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

const FloatingActionButton = () => {
  return (
    <Link href="/chat/new">
      <motion.div
        className="absolute bottom-6 right-4 z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="icon"
            className="w-14 h-14 rounded-2xl bg-foreground hover:bg-foreground/90 text-background shadow-2xl glow"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </Button>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default FloatingActionButton;