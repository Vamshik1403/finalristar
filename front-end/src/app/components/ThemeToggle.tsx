"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={
        "relative flex items-center justify-center w-11 h-11 rounded-full border-2 border-transparent outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 " +
        "bg-gradient-to-br from-orange-100 via-white to-orange-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-orange-400/10 " +
        "hover:border-orange-400 hover:shadow-[0_0_16px_4px_rgba(255,140,0,0.25)] " +
        "active:scale-95 "
        + " theme-toggle-rotate"
      }
      whileHover={{ scale: 1.18 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 1 }}
      animate={{ backgroundColor: isDark ? "#18181b" : "#fff" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        boxShadow: isDark
          ? "0 0 12px 2px rgba(255,140,0,0.10)"
          : "0 0 12px 2px rgba(255,140,0,0.18)",
      }}
    >
      <style jsx>{`
        .theme-toggle-rotate:hover {
          animation: rotate360 1.2s linear infinite;
        }
        @keyframes rotate360 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center"
          >
            <Sun className="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(255,140,0,0.5)]" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center"
          >
            <Moon className="w-6 h-6 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </motion.span>
        )}
      </AnimatePresence>
      {/* Glowing ring effect */}
      <span className="absolute inset-0 rounded-full pointer-events-none border-2 border-transparent group-hover:border-orange-400 animate-pulse" />
    </motion.button>
  );
} 