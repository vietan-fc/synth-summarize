import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-lg border border-ink-600 bg-ink-800/50 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "focus:border-brand-500 focus:bg-ink-800",
        error: "border-error/50 bg-error/5 focus:border-error",
        success: "border-success/50 bg-success/5 focus:border-success",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, leftIcon, rightIcon, error, label, hint, ...props }, ref) => {
    const hasError = error || variant === "error";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-ink-200 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              {leftIcon}
            </div>
          )}
          
          <input
            className={cn(
              inputVariants({ variant: hasError ? "error" : variant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || hint) && (
          <p className={cn(
            "mt-2 text-xs",
            hasError ? "text-error" : "text-ink-400"
          )}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;