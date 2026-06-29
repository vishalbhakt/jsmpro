"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface EmptyStateProps {
  /** Optional SVG or Icon */
  icon?: ReactNode;
  /** Main heading */
  title: string;
  /** Supporting text */
  description?: string;
  /** Optional CTA button label */
  actionLabel?: string;
  /** Callback when CTA is clicked */
  onAction?: () => void;
  /** Optional CSS class for the container */
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <AnimatePresence>
      <motion.div
        className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {icon && (
          <div className="mb-4 text-6xl text-[#d4af37]">
            {icon}
          </div>
        )}
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-base text-slate-600 dark:text-slate-400 mb-6 max-w-md">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="btn-primary hover:bg-[#b8961e] transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
