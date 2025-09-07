import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: [
          "bg-brand-600 text-white shadow-lg",
          "hover:bg-brand-700 hover:shadow-xl hover:glow-brand",
          "active:bg-brand-800 active:scale-95",
        ],
        secondary: [
          "bg-ink-700 text-ink-200 border border-ink-600",
          "hover:bg-ink-600 hover:text-ink-100 hover:border-ink-500",
          "active:bg-ink-800 active:scale-95",
        ],
        ghost: [
          "text-ink-300 hover:text-ink-100",
          "hover:bg-ink-800/50",
          "active:bg-ink-700/50 active:scale-95",
        ],
        destructive: [
          "bg-error text-error-foreground shadow-lg",
          "hover:bg-error/90 hover:shadow-xl",
          "active:bg-error/80 active:scale-95",
        ],
        link: [
          "text-brand-400 underline-offset-4",
          "hover:underline hover:text-brand-300",
          "active:text-brand-500",
        ],
        hero: [
          "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-2xl glow-brand-lg",
          "hover:from-brand-500 hover:to-brand-600 hover:shadow-2xl hover:scale-105",
          "active:scale-100 active:from-brand-700 active:to-brand-800",
        ],
        outline: [
          "border border-ink-600 text-ink-200 bg-transparent",
          "hover:bg-ink-800/50 hover:border-ink-500 hover:text-ink-100",
          "active:bg-ink-700/50 active:scale-95",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-14 px-8 py-4 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;