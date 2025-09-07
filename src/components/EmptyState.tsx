import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-ink-800 flex items-center justify-center mb-4">
        <div className="text-ink-400">
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-ink-100 mb-2">
        {title}
      </h3>
      
      <p className="text-ink-400 max-w-md mb-6">
        {description}
      </p>
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;