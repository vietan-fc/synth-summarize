import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "brand" | "white";
}

const LoadingSpinner = ({ size = "md", className, variant = "default" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variantClasses = {
    default: "border-ink-600 border-t-ink-300",
    brand: "border-brand-800 border-t-brand-400",
    white: "border-white/20 border-t-white",
  };

  return (
    <motion.div
      className={cn(
        "rounded-full border-2 animate-spin",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

export default LoadingSpinner;