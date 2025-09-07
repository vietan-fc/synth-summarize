import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Avatar = ({ src, alt, fallback, size = "md", className }: AvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide image on error and show fallback
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="select-none">
          {fallback ? getInitials(fallback) : "?"}
        </span>
      )}
    </div>
  );
};

export default Avatar;