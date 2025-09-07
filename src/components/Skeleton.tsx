import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
}

const Skeleton = ({ className, variant = "rect" }: SkeletonProps) => {
  const variantClasses = {
    text: "h-4 w-full",
    rect: "h-12 w-full",
    circle: "h-12 w-12 rounded-full",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-ink-700/50 rounded-lg shimmer",
        variantClasses[variant],
        className
      )}
    />
  );
};

export default Skeleton;