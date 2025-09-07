import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "brand" | "success" | "warning" | "error";
  showLabel?: boolean;
  label?: string;
}

const ProgressBar = ({
  value,
  className,
  size = "md",
  variant = "default",
  showLabel = false,
  label,
}: ProgressBarProps) => {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-brand-600",
    brand: "bg-gradient-to-r from-brand-500 to-brand-600",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
  };

  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-ink-200">
            {label || "Progress"}
          </span>
          <span className="text-sm text-ink-400">{Math.round(clampedValue)}%</span>
        </div>
      )}
      
      <div
        className={cn(
          "w-full bg-ink-700 rounded-full overflow-hidden",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progress ${Math.round(clampedValue)}%`}
      >
        <motion.div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            variantClasses[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;