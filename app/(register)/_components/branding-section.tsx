import { motion } from "framer-motion";

interface BrandingSectionProps {
  showMobileButton?: boolean;
  onSignInClick?: () => void;
}

const BRAND_NAME : string = "Next Chat";
const MOTTO = "Chatting platform , built by M-Arham07"

export function BrandingSection({ showMobileButton, onSignInClick }: BrandingSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-6"
      >
        {/* Logo / Brand Mark */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground"
          >
            <span className="text-2xl font-bold text-background">▲</span>
          </motion.div>
        </div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-bold tracking-tight lg:text-5xl"
        >
          {BRAND_NAME}
        </motion.h1>

        {/* Motto */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-sm text-lg text-muted-foreground lg:text-xl"
        >
          {MOTTO}
        </motion.p>

        {/* Mobile Sign In Button */}
        {showMobileButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={onSignInClick}
            className="mt-8 w-full rounded-xl bg-foreground px-8 py-4 text-base font-medium text-background transition-all duration-200 hover:opacity-90 active:scale-[0.98] lg:hidden"
          >
            Sign In
          </motion.button>
        )}

        {/* Decorative elements for PC */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 hidden space-y-3 lg:block"
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-px w-8 bg-border" />
            <span>Trusted by developers worldwide</span>
          </div>
          <div className="flex gap-6 opacity-50">
            <span className="text-sm font-medium">Vercel</span>
            <span className="text-sm font-medium">Stripe</span>
            <span className="text-sm font-medium">Linear</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
