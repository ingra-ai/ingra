"use client"

import { cn } from "@repo/shared/lib/utils";
import { motion } from "framer-motion"
import { Cloud } from 'lucide-react'
import { useEffect, useState } from "react";

interface LoaderV1Props {
  className?: string;
  message?: string;
  cloudSize?: number;
  duration?: number;
  delay?: number;
  fallbackUrl?: string;
}

export function LoaderV1({
  className = "min-h-48",
  message = "Loading...",
  cloudSize = 26,
  duration = 1.5,
  delay = 0.2,
  fallbackUrl = "/",
}: LoaderV1Props) {
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true)
      console.log('Loader fallback triggered: Loading took too long')
    }, 10000) // Show fallback after 10 seconds

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={ cn("flex flex-col items-center justify-center space-y-4", className) }>
      <div className="flex items-center justify-center space-x-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: i * delay,
              ease: "easeInOut",
            }}
            className="text-primary"
          >
            <Cloud size={cloudSize} />
          </motion.div>
        ))}
      </div>
      <motion.span
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
        className="text-sm font-medium text-primary relative overflow-hidden d-inline-block"
      >
        { message }
      </motion.span>
      {showFallback && fallbackUrl && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <a href={ fallbackUrl } target="_self" className="text-xs dark:text-blue-300 text-blue-700 hover:underline">
            Taking too long? Click here to return to homepage
          </a>
        </motion.div>
      )}
    </div>
  )
}
