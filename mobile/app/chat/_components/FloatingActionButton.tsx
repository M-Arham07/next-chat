import { Plus } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { motion } from "@/lib/motion";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

const FloatingActionButton = () => {
  const router = useRouter();
  return (
    <motion.div
      className="absolute bottom-6 right-4 z-20"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.3,
      }}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Pressable onPress={() => (router.push as (href: string) => void)("/chat/new")}>
          <Button size="icon" className="w-14 h-14 rounded-2xl bg-foreground shadow-2xl glow">
            <Plus size={24} />
          </Button>
        </Pressable>
      </motion.div>
    </motion.div>
  );
};

export default FloatingActionButton;
