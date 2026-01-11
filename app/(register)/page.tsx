"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandingSection } from "./_components/branding-section";
import { LoginForm } from "./_components/login-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function Auth() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Noise Overlay */}
      <div className="noise-overlay fixed inset-0 z-0" />

      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1 }}
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-muted to-transparent blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-muted to-transparent blur-3xl"
        />
      </div>

      {/* Theme Toggle */}
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Layout: Side by Side */}
        <div className="hidden w-full lg:flex">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex w-1/2 items-start justify-center border-r border-border p-12 pt-[15vh]"
          >
            <BrandingSection />
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex w-1/2 items-center justify-center p-12"
          >
            <div className="glass-panel w-full max-w-md p-8">
              <LoginForm />
            </div>
          </motion.div>
        </div>

        {/* Mobile Layout: Stack with State Toggle */}
        <div className="flex w-full flex-col lg:hidden">
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.div
                key="branding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex min-h-screen flex-col items-center justify-center p-6"
              >
                <BrandingSection
                  showMobileButton
                  onSignInClick={() => setShowForm(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex min-h-screen flex-col items-center justify-center p-6"
              >
                <div className="glass-panel w-full p-6">
                  <LoginForm
                    showBackButton
                    onBack={() => setShowForm(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
