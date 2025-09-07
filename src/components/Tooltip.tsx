"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  delayDuration?: number;
}

const Tooltip = ({ 
  content, 
  children, 
  side = "top", 
  className,
  delayDuration = 300 
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delayDuration);
    setTimer(timeout);
  };

  const hideTooltip = () => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    setIsVisible(false);
  };

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-ink-700",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-ink-700",
    left: "left-full top-1/2 -translate-y-1/2 border-l-ink-700",
    right: "right-full top-1/2 -translate-y-1/2 border-r-ink-700",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-3 py-2 text-xs font-medium text-ink-100 bg-ink-700 border border-ink-600 rounded-lg shadow-lg backdrop-blur-sm",
              sideClasses[side],
              className
            )}
            role="tooltip"
          >
            {content}
            
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-0 h-0 border-4 border-transparent",
                arrowClasses[side]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;