import { cn } from "@/lib/utils";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

const Kbd = ({ children, className }: KbdProps) => {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-1 rounded border border-ink-600 bg-ink-800 px-1.5 py-0.5 text-xs font-mono text-ink-300",
        className
      )}
    >
      {children}
    </kbd>
  );
};

export default Kbd;